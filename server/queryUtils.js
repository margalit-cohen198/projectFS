// utils/queryUtils.js

function buildQuery(table, queryParams, columnMapping = {}) {
    const conditions = [];
    const values = [];
    let orderBy = '';

    for (const key in queryParams) {
        if (key === 'sortBy') {
            const sortByColumn = columnMapping[queryParams[key]] || queryParams[key];
            const order = queryParams.order ? queryParams.order.toUpperCase() : 'ASC';
            if (sortByColumn) {
                orderBy = `ORDER BY ${sortByColumn} ${order}`;
            }
        } else if (key !== 'order') {
            const dbColumn = columnMapping[key] || key;
            conditions.push(`${dbColumn} = ?`);
            values.push(queryParams[key]);
        }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    return {
        whereClause,
        orderBy,
        values
    };
}

module.exports = {
    buildQuery
};