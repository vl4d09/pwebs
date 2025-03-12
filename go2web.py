import sys
import socket
import re
from urllib.parse import urlparse, quote
import ssl
from bs4 import BeautifulSoup
import time
import json

cache = {}  

def send_http_request(url, max_redirects=5, accept_header="text/html"):
    if url in cache:
        return cache[url]  

    parsed_url = urlparse(url)
    host = parsed_url.netloc
    path = parsed_url.path or '/'
    if parsed_url.query:
        path += '?' + parsed_url.query

    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        context = ssl.create_default_context()
        s = context.wrap_socket(s, server_hostname=host)
        s.connect((host, 443))

        request = f"GET {path} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0\r\nAccept: {accept_header}\r\n\r\n"
        s.sendall(request.encode())

        response = b''
        while True:
            data = s.recv(4096)
            if not data:
                break
            response += data

        response = response.decode()
        s.close()

        status_line = response.split('\r\n')[0]
        status_code = int(status_line.split(' ')[1])

        if 300 <= status_code < 400 and max_redirects > 0:
            location = re.search(r'Location: (.*?)\r\n', response).group(1)
            if not urlparse(location).netloc:
                base_url = urlparse(url)
                location = base_url.scheme + "://" + base_url.netloc + location
            return send_http_request(location, max_redirects - 1, accept_header)

        cache[url] = response  # Store response in cache
        return response

    except Exception as e:
        return f"Error: {e}"

def parse_http_response(response):
    try:
        headers, body = response.split('\r\n\r\n', 1)
        content_type = re.search(r'Content-Type: (.*?)\r\n', headers).group(1) if re.search(r'Content-Type: (.*?)\r\n', headers) else "text/html"
        if "application/json" in content_type:
            return json.loads(body)
        else:
            return body
    except ValueError:
        return response

def remove_html_tags(text):
    clean = re.compile('<.*?>')
    return re.sub(clean, '', str(text))

def search_google(search_term):
    search_term = quote(search_term)
    url = f"https://www.google.com/search?q={search_term}"
    time.sleep(2) 
    response = send_http_request(url)
    body = parse_http_response(response)
    soup = BeautifulSoup(body, 'html.parser')

    results = []
    for link in soup.find_all('a'):
        href = link.get('href')
        if href and href.startswith('/url?q='):
            match = re.search(r'q=(.*?)&', href)
            if match:
                results.append(match.group(1))
        if len(results) >= 10:
            break
    print(f"Search results: {results}")
    return results

def main():
    if len(sys.argv) < 2:
        print("Usage: go2web -u <URL> [-j] | -s <search-term> | -h")
        return

    option = sys.argv[1]

    if option == '-u':
        url = sys.argv[2]
        accept_header = "application/json" if len(sys.argv) > 3 and sys.argv[3] == "-j" else "text/html"
        response = send_http_request(url, accept_header=accept_header)
        body = parse_http_response(response)
        print(remove_html_tags(body))
    elif option == '-s':
        search_term = ' '.join(sys.argv[2:])
        results = search_google(search_term)
        for result in results:
            print(result)
    elif option == '-h':
        print("go2web -u <URL> [-j]       # make an HTTP request to the specified URL and print the response, -j for json")
        print("go2web -s <search-term> # make an HTTP request to search the term using your favorite search engine and print top 10 results")
        print("go2web -h               # show this help")
    else:
        print("Invalid option")

if __name__ == "__main__":
    main()