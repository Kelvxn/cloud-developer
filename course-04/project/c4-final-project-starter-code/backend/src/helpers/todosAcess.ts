import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

// const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
    ) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
              ':userId': userId
            },
            ScanIndexForward: false
        }).promise()
      
        const todos = result.Items

        return todos as TodoItem[];

    }

  async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise();

    logger.info("Todo successfully created.", todoItem)
    return todoItem
  }

  async updateTodoItem(userId: string, todoId: string, updatedTodo: TodoUpdate) {
    await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'SET #n = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues : {
          ':name': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done
        },
        ExpressionAttributeNames: {
          '#n': 'name'
        }
      }).promise();

    logger.info("Todo has been updated successfully.")
    return updatedTodo
  }

  async deleteTodoItem(userId: string, todoId: string) {
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      }).promise();

    logger.info("Todo has been deleted successfully.")
  }
 

}
