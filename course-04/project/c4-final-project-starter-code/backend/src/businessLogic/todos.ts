import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import { createLogger } from '../utils/logger'

import * as uuid from 'uuid'


// TODO: Implement businessLogic
const todoAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    return todoAccess.getAllTodos(userId);
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
    
    const todoId = uuid.v4();
    const bucketName = process.env.ATTACHMENT_S3_BUCKET;
    
    const newTodoItem = {
        userId: userId,
        todoId: todoId,
        attachmentUrl:`https://${bucketName}.s3.amazonaws.com/${todoId}`,
        createdAt: new Date().getTime().toString(),
        done: false,
        ...createTodoRequest
    }
    
    return todoAccess.createTodoItem(newTodoItem)
}

export async function updateTodo(userId:string, todoId: string, updateTodoRequest: UpdateTodoRequest){
    return todoAccess.updateTodoItem(userId, todoId, updateTodoRequest)
}

export async function deleteTodo(userId: string, todoId: string){
    return todoAccess.deleteTodoItem(userId, todoId)
}

export function createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return attachmentUtils.generateUploadUrl(todoId)
}
