package ir.ac.ut.ece.ie.pages;

import java.util.Date;

public class Page3 {

	public byte[] pageBody() {
		return ("<html>"
			 + "<header>"
			 + "<title>"
			 + "Time Page"
			 + "</title>"
			 + "</header>"
			 + "<body>"
			 + "The current time is: "
			 + (new Date()).toString()
			 + "</body>").getBytes();
	}
}
