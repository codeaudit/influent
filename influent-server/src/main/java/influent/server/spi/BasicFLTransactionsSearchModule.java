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
package influent.server.spi;

import com.google.inject.AbstractModule;
import com.google.inject.Provides;
import com.google.inject.Singleton;
import com.google.inject.name.Named;
import influent.idl.FL_ClusteringDataAccess;
import influent.idl.FL_LinkSearch;
import influent.server.dataaccess.DataNamespaceHandler;
import influent.server.search.DataViewLinkSearch;
import influent.server.sql.SQLBuilder;
import influent.server.utilities.SQLConnectionPool;
import oculus.aperture.spi.common.Properties;


public class BasicFLTransactionsSearchModule extends AbstractModule {

	@Override
	protected void configure() {
		bind(FL_LinkSearch.class).to(DataViewLinkSearch.class);
	}




	/*
	 * Provide the database service
	 */
	@Provides @Singleton
	public DataViewLinkSearch connect (
		@Named("aperture.server.config") Properties config,
		SQLConnectionPool connectionPool,
		DataNamespaceHandler namespaceHandler,
		SQLBuilder sqlBuilder,
		FL_ClusteringDataAccess clusterDataAccess
	) {
		try {
			return new DataViewLinkSearch(
					config,
					connectionPool,
					namespaceHandler,
					sqlBuilder,
					clusterDataAccess);
		} catch (Exception e) {
			addError("Failed to create Link Search", e);
			return null;
		}
	}
}