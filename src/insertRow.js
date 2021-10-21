const { BigQuery } = require("@google-cloud/bigquery");
require("util").inspect.defaultOptions.depth = null;

/**
 *
 * @param {object} payload
 * @param {string} payload.datasetId the dataset
 * @param {string} payload.tableId the table id
 * @param {array} payload.rows array of rows
 */
async function insertRows(payload) {
  // Inserts the JSON objects into my_dataset:my_table.
  const bigquery = new BigQuery();

  // Insert data into a table
  const tables = await bigquery
    .dataset(payload.datasetId)
    .table(payload.tableId)
    .insert(payload.rows);
}

export default insertRows;
