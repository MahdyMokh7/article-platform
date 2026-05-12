package ir.ac.ut.ece.ie;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class SanityCheckTest {

    @Test
    void testJUnitWorks() {
        assertTrue(true);
        System.out.println("✅ JUnit is working correctly!");
    }

    @Test
    void testAddition() {
        assertEquals(4, 2 + 2);
    }
}
