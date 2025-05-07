#!/usr/bin/env python3

import sys
import socket
import re
from urllib.parse import urlparse, quote, unquote
import ssl
from bs4 import BeautifulSoup
import time
import json
import os
import hashlib
import pickle
from datetime import datetime, timedelta
import webbrowser  
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(message)s')

CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "web_cache")
CACHE_EXPIRY = timedelta(hours=24)  

if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

def get_cache_filename(url):
    url_hash = hashlib.md5(url.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{url_hash}.cache")

def get_from_cache(url):
    cache_file = get_cache_filename(url)
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'rb') as f:
                timestamp, cached_data = pickle.load(f)
                if datetime.now() - timestamp < CACHE_EXPIRY:
                    return cached_data
        except Exception as e:
            print(f"Cache error: {e}")
    return None

def save_to_cache(url, data):
    cache_file = get_cache_filename(url)
    try:
        with open(cache_file, 'wb') as f:
            pickle.dump((datetime.now(), data), f)
    except Exception as e:
        print(f"Failed to cache: {e}")

def clear_cache():
    if os.path.exists(CACHE_DIR):
        for file in os.listdir(CACHE_DIR):
            if file.endswith(".cache"):
                os.remove(os.path.join(CACHE_DIR, file))
        print("Cache cleared.")
    else:
        print("No cache to clear.")

def send_http_request(url, max_redirects=30, accept_header="text/html", use_cache=True, redirect_chain=None):
    if redirect_chain is None:
        redirect_chain = []
        print(f"Starting request to: {url}")
    
    if use_cache:
        cached_response = get_from_cache(url)
        if cached_response:
            logging.debug(f"Cache hit for URL: {url}")
            return cached_response
    
    parsed_url = urlparse(url)
    scheme = parsed_url.scheme or "https"
    host = parsed_url.netloc
    path = parsed_url.path or '/'
    if parsed_url.query:
        path += '?' + parsed_url.query
        
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        
        if scheme == "https":
            port = 443
            context = ssl.create_default_context()
            s = context.wrap_socket(s, server_hostname=host)
        else:
            port = 80
            
        s.connect((host, port))
        request = f"GET {path} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0\r\nAccept: {accept_header}\r\n\r\n"
        s.sendall(request.encode())
        
        response = b''
        while True:
            data = s.recv(4096)
            if not data:
                break
            response += data
            
        response = response.decode(errors='replace')
        s.close()
        
        status_line = response.split('\r\n')[0]
        try:
            status_code = int(status_line.split(' ')[1])
            status_message = ' '.join(status_line.split(' ')[2:])
        except (IndexError, ValueError):
            return f"Error parsing status line: {status_line}"
        
        if 300 <= status_code < 400 and max_redirects > 0:
            location_match = re.search(r'Location: (.*?)\r\n', response)
        
            if location_match:
                location = location_match.group(1)
                redirect_chain.append((url, location, status_code, status_message))
                print(f"Redirect #{len(redirect_chain)}: {url} → {location} ({status_code} {status_message})")
                
                if not urlparse(location).netloc:
                    base_url = parsed_url
                    if location.startswith('/'):
                        location = f"{scheme}://{base_url.netloc}{location}"
                    else:
                        path_parts = base_url.path.split('/')
                        location = f"{scheme}://{base_url.netloc}{'/'.join(path_parts[:-1])}/{location}"
                
                return send_http_request(location, max_redirects - 1, accept_header, use_cache, redirect_chain)
        
        if redirect_chain:
            print(f"Final destination reached after {len(redirect_chain)} redirect(s)")
            
        # Cache the successful response
        if use_cache:
            save_to_cache(url, response)
            
        return response
    except Exception as e:
        logging.error(f"Error during request to {url}: {e}")
        return f"Error: {e}"

def parse_http_response(response):
    try:
        if '\r\n\r\n' in response:
            headers, body = response.split('\r\n\r\n', 1)
            content_type = re.search(r'Content-Type: (.*?)\r\n', headers)
            content_type = content_type.group(1) if content_type else "text/html"
            
            if "application/json" in content_type:
                try:
                    return json.loads(body)
                except json.JSONDecodeError:
                    return body
            else:
                return body
        else:
            return response
    except ValueError:
        return response

def extract_text_content(html):
    soup = BeautifulSoup(html, 'html.parser')
    
    for script_or_style in soup(['script', 'style', 'meta', 'link']):
        script_or_style.extract()
    
    text = soup.get_text()
    
    lines = (line.strip() for line in text.splitlines())
    
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    
    text = '\n'.join(chunk for chunk in chunks if chunk)
    
    return text

def parse_json_data(data):
    try:
        if isinstance(data, dict):
            return data
        
        jsonp_match = re.match(r'^[\w.]+\((.*)\);?$', data.strip())
        if jsonp_match:
            jsonp_content = jsonp_match.group(1)
            return json.loads(jsonp_content)
        
        return json.loads(data)
    except (json.JSONDecodeError, TypeError):
        return data

def extract_text_between_tags(html, start_tag, end_tag):
    pattern = f'{start_tag}(.*?){end_tag}'
    match = re.search(pattern, html, re.DOTALL)
    if match:
        return match.group(1)
    return None

def search_brave(search_term):
    search_term = quote(search_term)
    url = f"https://search.brave.com/search?q={search_term}"
    
    response = send_http_request(url, use_cache=False)
    body = parse_http_response(response)
    
    soup = BeautifulSoup(body, 'html.parser')
    results = []
    
    for result in soup.find_all(['div', 'article'], class_=['fdb', 'snippet', 'result']):
        a_tag = result.find('a')
        if not a_tag:
            continue
            
        href = a_tag.get('href', '')
        if (href.startswith('http') and 
            'brave.com' not in href and 
            not href.startswith('/search')):
            
            title = a_tag.text.strip()
            if title and len(title) > 5:  
                results.append((href, title))
    
    if not results:
        for a_tag in soup.find_all('a'):
            href = a_tag.get('href', '')
            if (href.startswith('http') and 
                'brave.com' not in href and 
                not href.startswith('/search')):
                
                title = a_tag.text.strip()
                if title and len(title) > 5:  
                    results.append((href, title))
    
    # If we still have no results, simpler approach with regex
    if not results:
        links = re.findall(r'<a\s+(?:[^>]*?\s+)?href="(http[s]?://(?!search\.brave\.com)[^"]*)"[^>]*>([^<]+)</a>', body)
        for href, title in links:
            if len(title.strip()) > 5:
                results.append((href, title.strip()))
    
    unique_results = []
    seen_urls = set()
    for url, title in results:
        if url not in seen_urls:
            seen_urls.add(url)
            unique_results.append((url, title))
    
    return unique_results[:10]  

def open_in_browser(url):
    try:
        webbrowser.open(url)
        return True
    except Exception as e:
        print(f"Error opening browser: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: go2web -u <URL> [-j] | -s <search-term> | -c | -h")
        return
    
    option = sys.argv[1]
    
    if option == '-u':
        if len(sys.argv) < 3:
            print("Error: URL required")
            return
            
        url = sys.argv[2]
        if not (url.startswith('http://') or url.startswith('https://')):
            url = 'https://' + url
        
        json_mode = len(sys.argv) > 3 and sys.argv[3] == "-j"
        accept_header = "application/json" if json_mode else "text/html"
        
        print(f"Fetching {url}...")
        response = send_http_request(url, accept_header=accept_header)
        body = parse_http_response(response)
        
        is_json = False
        if isinstance(body, dict):
            is_json = True
            formatted_body = json.dumps(body, indent=2)
        elif isinstance(body, str):
            if body.strip().startswith('{') or body.strip().startswith('[') or re.match(r'^[\w.]+\(', body.strip()):
                try:
                    parsed_json = parse_json_data(body)
                    if isinstance(parsed_json, (dict, list)):
                        is_json = True
                        formatted_body = json.dumps(parsed_json, indent=2)
                    else:
                        formatted_body = extract_text_content(body)
                except:
                    formatted_body = extract_text_content(body)
            else:
                formatted_body = extract_text_content(body)
        else:
            formatted_body = str(body)
        
        print(formatted_body)
        
        open_browser = input("\nDo you want to open this URL in your browser? (y/n): ")
        if open_browser.lower() == 'y':
            open_in_browser(url)
        
    elif option == '-s':
        if len(sys.argv) < 3:
            print("Error: Search term required")
            return
            
        search_term = ' '.join(sys.argv[2:])
        print(f"Searching for '{search_term}'...")
        results = search_brave(search_term)
        
        if not results:
            print("No search results found.")
            return
        
        # Store results for later selection
        stored_results = {}
        
        print(f"\nSearch results for '{search_term}':")
        for i, (url, title) in enumerate(results, 1):
            stored_results[i] = url
            print(f"{i}. {title}\n   {url}\n")
            
        # Allowuser to select a result
        try:
            choice = input("Enter number to open (1-10), add 'b' to open in browser (e.g., '3b'), add 'j' for JSON mode (e.g., '3j'), or press Enter to exit: ")
            
            open_browser = False
            json_mode = False
            
            if choice.strip():
                if 'b' in choice.lower():
                    open_browser = True
                    choice = choice.lower().replace('b', '')
                
                if 'j' in choice.lower():
                    json_mode = True
                    choice = choice.lower().replace('j', '')
                
                choice = int(choice)
                if 1 <= choice <= len(results):
                    selected_url = stored_results[choice]
                    
                    if open_browser:
                        print(f"Opening {selected_url} in browser...")
                        open_in_browser(selected_url)
                    else:
                        print(f"Fetching {selected_url}...")
                        accept_header = "application/json" if json_mode else "text/html"
                        response = send_http_request(selected_url, accept_header=accept_header)
                        body = parse_http_response(response)
                        
                        # Determine if response is JSON or contains JSON
                        is_json = False
                        if isinstance(body, dict):
                            is_json = True
                            formatted_body = json.dumps(body, indent=2)
                        elif isinstance(body, str):
                            # Check if it's a JSON string or JSONP
                            if body.strip().startswith('{') or body.strip().startswith('[') or re.match(r'^[\w.]+\(', body.strip()):
                                try:
                                    parsed_json = parse_json_data(body)
                                    if isinstance(parsed_json, (dict, list)):
                                        is_json = True
                                        formatted_body = json.dumps(parsed_json, indent=2)
                                    else:
                                        formatted_body = extract_text_content(body)
                                except:
                                    formatted_body = extract_text_content(body)
                            else:
                                formatted_body = extract_text_content(body)
                        else:
                            formatted_body = str(body)
                        
                        print(formatted_body)
                        
                        browser_option = input("\nDo you want to open this URL in your browser? (y/n): ")
                        if browser_option.lower() == 'y':
                            open_in_browser(selected_url)
                else:
                    print("Invalid selection.")
        except ValueError:
            print("Invalid input.")
    
    elif option == '-c':
        clear_cache()
        
    elif option == '-h':
        print("go2web -u <URL> [-j] # make an HTTP request to the specified URL and print the text content")
        print("                     # with option to open in browser, -j for JSON mode")
        print("go2web -s <search-term> # search for the term and display top 10 results")
        print("                        # with option to select a result to view its content or open in browser")
        print("                        # add 'j' to selection (e.g., '3j') for JSON mode")
        print("go2web -c # clear the cache")
        print("go2web -h # show this help")
    else:
        print("Invalid option")

if __name__ == "__main__":
    main()