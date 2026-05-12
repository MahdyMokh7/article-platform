package ir.ac.ut.ece.ie.staticcontentserver;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.RandomAccessFile;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.StringTokenizer;

public class StaticContentServer {
    ServerSocket serverSocket;

    public void start() throws IOException {
        serverSocket = new ServerSocket(9091);
        System.out.println("Static Content Server started on port 9091");

        while (true) {
            Socket socket = serverSocket.accept();
            try {
                BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                String readLine = reader.readLine();

                if (readLine == null || readLine.isEmpty()) {
                    socket.close();
                    continue;
                }

                System.out.println("Static request: " + readLine);
                String fileName = getFileName(readLine);

                try {
                    File file = new File("./src/main/resources/" + fileName);

                    // Check if file exists
                    if (!file.exists()) {
                        send404(socket);
                        continue;
                    }

                    // Get correct content type based on file extension
                    String contentType = getContentType(fileName);

                    // Fixed HTTP version from "HTTP1.1" to "HTTP/1.1"
                    String header = "HTTP/1.1 200 OK\r\n" +
                            "Content-Type: " + contentType + "\r\n" +
                            "Content-Length: " + file.length() + "\r\n" +
                            "Connection: close\r\n\r\n";

                    RandomAccessFile raf = new RandomAccessFile(file, "r");
                    socket.getOutputStream().write(header.getBytes());

                    byte[] data = new byte[8192]; // Larger buffer for better performance
                    int size;
                    while ((size = raf.read(data)) != -1) {
                        socket.getOutputStream().write(data, 0, size);
                    }
                    raf.close();

                } catch (FileNotFoundException e) {
                    send404(socket);
                }

                socket.getOutputStream().flush();
                socket.close();

            } catch (IOException e) {
                e.printStackTrace();
                try {
                    socket.close();
                } catch (IOException ex) {
                    // Ignore
                }
            }
        }
    }

    private String getFileName(String readLine) {
        StringTokenizer tokenizer = new StringTokenizer(readLine, " ");
        tokenizer.nextToken(); // Skip GET
        String path = tokenizer.nextToken();

        // Remove query string if present
        if (path.contains("?")) {
            path = path.substring(0, path.indexOf("?"));
        }

        // Remove leading slash
        String fileName = path.substring(1);

        // Default to index.html if root is requested
        if (fileName.isEmpty()) {
            fileName = "index.html";
        }

        return fileName;
    }

    private String getContentType(String fileName) {
        // Get file extension
        String extension = "";
        int lastDot = fileName.lastIndexOf(".");
        if (lastDot > 0) {
            extension = fileName.substring(lastDot + 1).toLowerCase();
        }

        // Map extensions to MIME types
        switch (extension) {
            case "html":
            case "htm":
                return "text/html; charset=UTF-8";
            case "txt":
                return "text/plain; charset=UTF-8";
            case "css":
                return "text/css";
            case "js":
                return "application/javascript";
            case "json":
                return "application/json";
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "svg":
                return "image/svg+xml";
            case "ico":
                return "image/x-icon";
            case "pdf":
                return "application/pdf";
            case "zip":
                return "application/zip";
            default:
                return "application/octet-stream";
        }
    }

    private void send404(Socket socket) throws IOException {
        String errorPage = "<html><body><h1>404 - File Not Found</h1></body></html>";
        String header = "HTTP/1.1 404 Not Found\r\n" +
                "Content-Type: text/html; charset=UTF-8\r\n" +
                "Content-Length: " + errorPage.length() + "\r\n" +
                "Connection: close\r\n\r\n";

        socket.getOutputStream().write(header.getBytes());
        socket.getOutputStream().write(errorPage.getBytes());
        socket.getOutputStream().flush();
    }

    public void stop() throws IOException {
        if (serverSocket != null && !serverSocket.isClosed()) {
            serverSocket.close();
        }
    }

    public static void main(String[] args) throws IOException {
        StaticContentServer server = new StaticContentServer();
        server.start();
    }
}
