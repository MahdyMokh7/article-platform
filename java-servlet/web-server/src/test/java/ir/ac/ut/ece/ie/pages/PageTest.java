package ir.ac.ut.ece.ie.pages;

import org.junit.jupiter.api.Test;
import java.lang.reflect.Method;
import static org.junit.jupiter.api.Assertions.*;

public class PageTest {

    @Test
    void testEscapeHtml() throws Exception {
        // Test the escapeHtml method using reflection
        MainPage page = new MainPage();
        Method escapeMethod = MainPage.class.getDeclaredMethod("escapeHtml", String.class);
        escapeMethod.setAccessible(true);

        // Test special characters
        assertEquals("&lt;script&gt;", escapeMethod.invoke(page, "<script>"));
        assertEquals("&gt;", escapeMethod.invoke(page, ">"));
        assertEquals("&amp;", escapeMethod.invoke(page, "&"));
        assertEquals("&quot;", escapeMethod.invoke(page, "\""));

        // Test null input
        assertEquals("", escapeMethod.invoke(page, (String) null));

        // Test normal text (unchanged)
        assertEquals("Hello World", escapeMethod.invoke(page, "Hello World"));
    }
}
