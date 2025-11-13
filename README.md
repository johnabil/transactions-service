# Transactions Service

- This service is used to create, update, delete or get any transaction.
- It's made to last through verifying the consistency of transactions and
  audit logs created for each transaction. where we made sure every transaction
  created has a corresponding audit log and if transaction is
  deleted, rolled back or had any failures audit log is also rolled back.

### Starting the service

You can start the service using docker compose and it's preferred to
use local db connection rather than docker db connection.

**Note:** Make sure you have each service on different ports.

`docker compose up --build`
