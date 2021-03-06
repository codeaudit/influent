/*
 * Copyright (C) 2013-2015 Uncharted Software Inc.
 *
 * Property of Uncharted(TM), formerly Oculus Info Inc.
 * http://uncharted.software/
 *
 * Released under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package influent.selenium.tests;

import static org.junit.Assert.assertEquals;
import influent.selenium.util.SeleniumUtils;

import java.util.List;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class EntityDetailsTest extends BrowserParameterizedTest {
	
	public EntityDetailsTest(BROWSER browser) { super(browser); };
	
	private void getFlowViewResults(String query) {
		SeleniumUtils.navigateToTab(driver, SeleniumUtils.TAB_ACCOUNTS);
		
		List<WebElement> elements = driver.findElements(By.id("influent-view-toolbar-search-input"));
		
		WebElement element = SeleniumUtils.getDisplayedElement(elements);
		
		if (element == null) {
			throw new AssertionError("Couldn't find: influent-view-toolbar-search-input element");			
		}
				
		element.sendKeys(query);		
		elements = driver.findElements(By.className("infGoSearch"));
		element = SeleniumUtils.getDisplayedElement(elements);
		
		if (element == null) {
			throw new AssertionError("Couldn't find: infGoSearch element");			
		}
		
		element.click();
		try {
			Thread.sleep(1000);
		}
		catch (Exception e) {
			
		}
		element = (new WebDriverWait(driver, 120)).until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".infSearchResultCounts")));
		
		element = (new WebDriverWait(driver, 120)).until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(".infOperationsBar")));
		List<WebElement> switchViewButtons  = element.findElements(By.cssSelector("[switchesto]"));
		WebElement switchToFlowButton = null;
		for (WebElement e : switchViewButtons) {
			String switchTo = e.getAttribute("switchesto");
			if (switchTo.equals(SeleniumUtils.FLOW_NAME)) {
				switchToFlowButton = e;
			} 
		}
		if (switchToFlowButton == null) {
			throw new AssertionError("Couldn't find: Button to switch to flow view in infOperationsBar");
		}
		
		List<WebElement> dataIdElements = driver.findElements(By.cssSelector(".selectSingleResult input"));
		int elementsToSelect = 1;
		int elementsSelected = 0;
		for (WebElement e : dataIdElements) {
			e.click();
			elementsSelected++;
			if (elementsToSelect == elementsSelected) {
				break;
			}
		}
		
		switchToFlowButton.click();
		
		try {
			Thread.sleep(2000);
		} catch (Exception e) {}
	}
	
	@Test
	public void accountsViewButtonTest() {
		
		getFlowViewResults("joe");
		
		//Test a card that has no transactions
		
		List<WebElement> elements = driver.findElements(By.className("baseballcardContainer"));
		
		WebElement card1 = null;
		for (WebElement webElement : elements) {
			if (webElement.isDisplayed()) {
				if (card1 == null) {
					card1 = webElement;
					break;
				} 	
			}
		}
		
		if (card1 == null) {
			throw new AssertionError("Couldn't find: baseballcardContainer element");			
		}
		
		card1.click();
		
		//Wait a few seconds for page to load. This is needed despite waiting for presence of element
		try {
			Thread.sleep(2000);
		} catch (Exception e) {}
		
		WebElement element = (new WebDriverWait(driver, 120)).until(ExpectedConditions.presenceOfElementLocated(By.id("transactions-table-pagination-label")));
				
		element = driver.findElement(By.id("accountsViewButton"));
		
		element.click();
		
		element = (new WebDriverWait(driver, 120)).until(ExpectedConditions.presenceOfElementLocated(By.className("infSearchResultCounts")));
		assertEquals("Showing 1 of 1 results", element.getText());
		
		element = driver.findElement((By.className("simpleSearchResultText")));
		
		assertEquals("Name:JoeDescription:Joe, 40 years old, is still single. He has been managing a livestock business, particularly hog-raising, for almost 10 years. His net income every three months is 6,000 Philippine pesos (PHP) for every hog that he sell. He's asking for a loan of 12,000 PHP to purchase livestock feeds for his hogs. He hopes that Kiva lenders ...", element.getText());
	}
	
	@Test
	public void entityDetailsTest() {
		getFlowViewResults("name:\"joe\" countryCode:\"PE\" datatype:loan matchtype:\"any\"");
		
		List<WebElement> elements = driver.findElements(By.className("baseballcardContainer"));
		
		WebElement card1 = null;		
		for (WebElement webElement : elements) {
			if (webElement.isDisplayed()) {
				if (card1 == null) {
					card1 = webElement;
					break;
				}
			}
		}
		
		if (card1 == null) {
			throw new AssertionError("Couldn't find: baseballcardContainer element");			
		}
		
		card1.click();
		
		//Wait a few seconds for page to load. This is needed despite waiting for presence of element
		try {
			Thread.sleep(2000);
		} catch (Exception e) {}
		
		WebElement element = (new WebDriverWait(driver, 120)).until(ExpectedConditions.presenceOfElementLocated(By.id("details")));
				
		element = driver.findElement(By.className("detailsTitle"));
		assertEquals("Account Details", element.getText());
		
		element = driver.findElement(By.className("detailsEntityLabel"));
		assertEquals("Joe. Peru, PUCALLPA", element.getText());
		
		elements = driver.findElements(By.className("detailsIcon"));
		element = SeleniumUtils.getDisplayedElement(elements);
		String src = element.getAttribute("src");
		assertEquals("http://localhost:8080/kiva/rest/icon/aperture-hscb/Person?iconWidth=32&iconHeight=32", src);
		
		element = driver.findElement(By.id("entityDetailsImageLink"));		
		String href = element.getAttribute("href");
		assertEquals("http://www.kiva.org/img/w400/1118387.jpg", href);
		
		elements = driver.findElements(By.tagName("tr"));
		WebElement row1 = null;
		WebElement row2 = null;
		for (WebElement webElement : elements) {
			if (webElement.isDisplayed()) {
				if (row1 == null) {
					row1 = webElement;
				} else {
					row2 = webElement;
					break;
				}				
			}
		}				
		assertEquals("uid: a.loan.b438363", row1.getText());
		assertEquals("Posted Date: Jun 1, 2012", row2.getText());
	}
	
	@Test
	public void clusterSummaryDetailsTest() {
		getFlowViewResults("visionfund");
		
		//Test a card that has no transactions
		List<WebElement> elements = driver.findElements(By.className("baseballcardContainer"));
		WebElement element = SeleniumUtils.getDisplayedElement(elements);
		
		element.click();
		
		//Wait a few seconds for page to load. This is needed despite waiting for presence of element
		try {
			Thread.sleep(2000);
		} catch (Exception e) {}
		
		element = (new WebDriverWait(driver, 120)).until(ExpectedConditions.presenceOfElementLocated(By.id("details")));
				
		element = driver.findElement(By.className("detailsTitle"));
		assertEquals("Account Details", element.getText());
		
		element = driver.findElement(By.className("detailsEntityLabel"));
		assertEquals("VisionFund Albania", element.getText());
		
		elements = driver.findElements(By.className("detailsIcon"));
		element = SeleniumUtils.getDisplayedElement(elements);
		String src = element.getAttribute("src");
		assertEquals("http://localhost:8080/kiva/rest/icon/aperture-hscb/Organization?iconWidth=32&iconHeight=32&role=business", src);
		
		element = driver.findElement(By.id("entityDetailsImageLink"));		
		String href = element.getAttribute("href");
		assertEquals("http://www.kiva.org/img/w400/1092590.jpg", href);
		
		elements = driver.findElements(By.tagName("tr"));
		WebElement row1 = null;
		WebElement row2 = null;
		for (WebElement webElement : elements) {
			if (webElement.isDisplayed()) {
				if (row1 == null) {
					row1 = webElement;
				} else {
					row2 = webElement;
					break;
				}				
			}
		}				
		assertEquals("uid: o.partner.p239", row1.getText());
		assertEquals("partners_cc: AL", row2.getText());
	}
}
