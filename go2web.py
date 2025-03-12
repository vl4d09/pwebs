import sys
import socket
import re
from urllib.parse import urlparse, quote
import ssl

def send_http_request(url):
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
        request = f"GET {path} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n\r\n"
        s.sendall(request.encode())
        response = b''
        while True:
            data = s.recv(4096)
            if not data:
                break
            response += data
        s.close()
        return response.decode()
    except Exception as e:
        return f"Error: {e}"

def parse_http_response(response):
    try:
        headers, body = response.split('\r\n\r\n', 1)
        return body
    except ValueError:
        return response

def remove_html_tags(text):
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

def search_google(search_term):
    search_term = quote(search_term)
    url = f"https://www.google.com/search?q={search_term}"
    response = send_http_request(url)
    body = parse_http_response(response)
    results = re.findall(r'<a href="(/url\?q=.*?)"', body)
    if results:
        results = [re.search(r'q=(.*?)&', result).group(1) for result in results[:10] if re.search(r'q=(.*?)&', result)]
    else:
        results = []
    return results

def main():
    if len(sys.argv) < 2:
        print("Usage: go2web -u <URL> | -s <search-term> | -h")
        return

    option = sys.argv[1]

    if option == '-u':
        url = sys.argv[2]
        response = send_http_request(url)
        body = parse_http_response(response)
        print(remove_html_tags(body))
    elif option == '-s':
        search_term = sys.argv[2]
        results = search_google(search_term)
        for result in results:
            print(result)
    elif option == '-h':
        print("go2web -u <URL>         # make an HTTP request to the specified URL and print the response")
        print("go2web -s <search-term> # make an HTTP request to search the term using your favorite search engine and print top 10 results")
        print("go2web -h               # show this help")
    else:
        print("Invalid option")

if __name__ == "__main__":
    main()