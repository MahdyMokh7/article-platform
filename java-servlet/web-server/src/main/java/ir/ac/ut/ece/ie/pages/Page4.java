package ir.ac.ut.ece.ie.pages;

import java.util.Date;

public class Page4 {

	public byte[] pageBody() {
		return ("<html>"
			 + "<header>"
			 + "<title>"
			 + "Time Page 2!"
			 + "</title>"
			 + "</header>"
			 + "<body>"
			 + "The current time is: "
			 + (new Date()).toString()
			 + "</body>").getBytes();
	}
}
