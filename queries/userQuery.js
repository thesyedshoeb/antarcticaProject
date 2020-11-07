module.exports = {


    GET_USER: 'select email from user_table where email=$1 and password=$2',
    INSERT_USER: 'INSERT INTO user_table(email,password) VALUES ($1, $2) returning email',
    INSERT_EMPLOYEE: 'INSERT INTO employee_table(employee_id,email,first_name,last_name,organization_name) VALUES ($1, $2,$3,$4,$5) returning email',
    CHECK_USER: 'select email,employee_id from employee_table where email=$1 or employee_id=$2',
    // SEARCH_USER:'select first_name,last_name,email,employee_id,organization_name from employee_table where first_name=$1 and last_name=$2 ORDER BY employee_id ASC limit $3 OFFSET $4'



}