package ir.ac.ut.ece.ie.dynamiccontentserver;

import java.io.*;
import java.lang.reflect.Method;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URLDecoder;
import java.util.*;

public class DynamicContentServer {

    public void start() throws IOException {
        ServerSocket serverSocket = new ServerSocket(9092);
        System.out.println("Dynamic Content Server started on port 9092");

        while (true) {
            Socket socket = serverSocket.accept();
            handleRequest(socket);
        }
    }

    private void handleRequest(Socket socket) {
        try {
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            String requestLine = reader.readLine();

            if (requestLine == null || requestLine.isEmpty()) {
                socket.close();
                return;
            }

            System.out.println("Request: " + requestLine);

            // Parse request line
            StringTokenizer tokenizer = new StringTokenizer(requestLine, " ");
            String method = tokenizer.nextToken();
            String path = tokenizer.nextToken();

            // Parse path and query string
            String pageName = null;
            Map<String, String> queryParams = new HashMap<>();

            if (path.contains("?")) {
                String[] parts = path.split("\\?");
                pageName = parts[0].substring(1); // Remove leading slash
                String queryString = parts[1];
                parseQueryString(queryString, queryParams);
            } else {
                pageName = path.substring(1); // Remove leading slash
            }

            // Read headers
            Map<String, String> headers = new HashMap<>();
            String headerLine;
            int contentLength = 0;

            while ((headerLine = reader.readLine()) != null && !headerLine.isEmpty()) {
                String[] headerParts = headerLine.split(": ", 2);
                if (headerParts.length == 2) {
                    headers.put(headerParts[0], headerParts[1]);
                    if (headerParts[0].equalsIgnoreCase("Content-Length")) {
                        contentLength = Integer.parseInt(headerParts[1]);
                    }
                }
            }

            // Read POST data if present
            Map<String, String> postParams = new HashMap<>();
            if (method.equalsIgnoreCase("POST") && contentLength > 0) {
                char[] bodyChars = new char[contentLength];
                reader.read(bodyChars, 0, contentLength);
                String body = new String(bodyChars);
                parseQueryString(body, postParams);
            }

            // Prepare request object for page
            Map<String, Object> request = new HashMap<>();
            request.put("method", method);
            request.put("queryParams", queryParams);
            request.put("postParams", postParams);
            request.put("headers", headers);

            // Find and execute page class
            try {
                Class<?> pageClass = Class.forName("ir.ac.ut.ece.ie.pages." + pageName);
                Object page = pageClass.getDeclaredConstructor().newInstance();

                // Try to call pageBody with request parameter
                byte[] data = null;
                try {
                    Method methodWithRequest = pageClass.getMethod("pageBody", Map.class);
                    data = (byte[]) methodWithRequest.invoke(page, request);
                } catch (NoSuchMethodException e) {
                    // Fall back to no-parameter method
                    Method methodNoParams = pageClass.getMethod("pageBody");
                    data = (byte[]) methodNoParams.invoke(page);
                }

                sendResponse(socket, 200, "OK", "text/html", data);

            } catch (ClassNotFoundException e) {
                sendResponse(socket, 404, "Not Found", "text/html",
                        "Page not found".getBytes());
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(socket, 500, "Internal Server Error", "text/html",
                        ("Error: " + e.getMessage()).getBytes());
            }

            socket.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void parseQueryString(String queryString, Map<String, String> params) {
        try {
            String[] pairs = queryString.split("&");
            for (String pair : pairs) {
                String[] keyValue = pair.split("=", 2);
                String key = URLDecoder.decode(keyValue[0], "UTF-8");
                String value = keyValue.length > 1 ? URLDecoder.decode(keyValue[1], "UTF-8") : "";
                params.put(key, value);
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
    }

    private void sendResponse(Socket socket, int statusCode, String statusText,
                              String contentType, byte[] data) throws IOException {
        String header = "HTTP/1.1 " + statusCode + " " + statusText + "\r\n" +
                "Content-Type: " + contentType + "\r\n" +
                "Content-Length: " + data.length + "\r\n" +
                "Connection: close\r\n\r\n";

        socket.getOutputStream().write(header.getBytes());
        socket.getOutputStream().write(data);
        socket.getOutputStream().flush();
    }

    private String getPageName(String readLine) {
        StringTokenizer tokenizer = new StringTokenizer(readLine, " ");
        tokenizer.nextToken();
        String path = tokenizer.nextToken();
        if (path.contains("?")) {
            path = path.substring(0, path.indexOf("?"));
        }
        return path.substring(1);
    }

    public static void main(String[] args) throws IOException {
        DynamicContentServer server = new DynamicContentServer();
        server.start();
    }
}