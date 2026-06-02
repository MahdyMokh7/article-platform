@echo off
chcp 65001 > nul
echo ==========================================
echo ARTICLE PLATFORM API TESTS
echo ==========================================
echo.

echo [1] GET - List all articles
echo ------------------------------------------
curl -s http://localhost:8080/api/articles
echo.
echo.

echo [2] GET - Get article by ID 1
echo ------------------------------------------
curl -s http://localhost:8080/api/articles/1
echo.
echo.

echo [3] GET - Get article by ID 2
echo ------------------------------------------
curl -s http://localhost:8080/api/articles/2
echo.
echo.

echo [4] GET - Get article by ID 3
echo ------------------------------------------
curl -s http://localhost:8080/api/articles/3
echo.
echo.

echo [5] SEARCH - Search for "REST"
echo ------------------------------------------
curl -s "http://localhost:8080/api/articles/search?q=REST"
echo.
echo.

echo [6] SEARCH - Search for "Spring"
echo ------------------------------------------
curl -s "http://localhost:8080/api/articles/search?q=Spring"
echo.
echo.

echo [7] SEARCH - Search for "Hibernate"
echo ------------------------------------------
curl -s "http://localhost:8080/api/articles/search?q=Hibernate"
echo.
echo.

echo [8] CHECK TITLE - Existing title (should return false)
echo ------------------------------------------
curl -s "http://localhost:8080/api/articles/check-title?title=REST%20API%20Architecture"
echo.
echo.

echo [9] CHECK TITLE - New title (should return true)
echo ------------------------------------------
curl -s "http://localhost:8080/api/articles/check-title?title=Brand%20New%20Article"
echo.
echo.

echo [10] POPULAR - Get articles sorted by citation count
echo ------------------------------------------
curl -s http://localhost:8080/api/articles/popular
echo.
echo.

echo [11] POST - Create a new article
echo ------------------------------------------
curl -s -X POST http://localhost:8080/api/articles -H "Content-Type: application/json" -d "{\"title\":\"My Custom Article\",\"abstractText\":\"This is my test article from HTTP client\",\"body\":\"This is the full content of my custom test article.\"}"
echo.
echo.

echo [12] POST - Create article with references (Bonus feature)
echo ------------------------------------------
curl -s -X POST http://localhost:8080/api/articles -H "Content-Type: application/json" -d "{\"title\":\"Advanced REST Concepts\",\"abstractText\":\"Building on REST fundamentals\",\"body\":\"This article references previous REST articles for deeper understanding.\",\"referenceIds\":[1,2]}"
echo.
echo.

echo [13] GET - Verify new article was created
echo ------------------------------------------
curl -s http://localhost:8080/api/articles
echo.
echo.

echo [14] POST - Try duplicate title (should fail with 409 Conflict)
echo ------------------------------------------
curl -s -X POST http://localhost:8080/api/articles -H "Content-Type: application/json" -d "{\"title\":\"REST API Architecture\",\"abstractText\":\"This should fail\",\"body\":\"Duplicate title not allowed\"}"
echo.
echo.

echo [15] GET - Non-existent article (should return 404 Not Found)
echo ------------------------------------------
curl -s http://localhost:8080/api/articles/999
echo.
echo.

echo [16] SEARCH - Empty search (should return empty array)
echo ------------------------------------------
curl -s "http://localhost:8080/api/articles/search?q="
echo.
echo.

echo [17] SEARCH - Search with no matches (should return empty array)
echo ------------------------------------------
curl -s "http://localhost:8080/api/articles/search?q=xyzabc123"
echo.
echo.

echo [18] GET - Check citation count on article 1
echo ------------------------------------------
curl -s http://localhost:8080/api/articles/1
echo.
echo.

echo [19] GET - Check references on article 3
echo ------------------------------------------
curl -s http://localhost:8080/api/articles/3
echo.
echo.

echo [20] GET - Popular articles again after adding new ones
echo ------------------------------------------
curl -s http://localhost:8080/api/articles/popular
echo.
echo.

echo ==========================================
echo ALL TESTS COMPLETED!
echo ==========================================
pause