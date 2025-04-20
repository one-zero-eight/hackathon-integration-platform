# MWS AI JSON Schema Builder backend

## About

This is a backend system for AI Schema Builder

### Technologies
- [Python 3.12](https://www.python.org/downloads/) & [uv](https://github.com/astral-sh/uv)
- [FastAPI](https://fastapi.tiangolo.com/) & [Pydantic](https://docs.pydantic.dev/latest/)
- AI: [MWS GPT API](https://api.gpt.mws.ru/), [LangChain](https://www.langchain.com/)
- Formatting and linting: [Ruff](https://docs.astral.sh/ruff/), [pre-commit](https://pre-commit.com/)
- Deployment: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

## Deployment
1. Copy the file with settings: `cp settings.example.yaml settings.yaml`
2. Change settings in the `settings.yaml` file according to your needs
   (check [settings.schema.yaml](settings.schema.yaml) for more info)
3. Build a Docker image: `docker compose build --pull`
4. Run the container: `docker compose up --detach`
5. Check the logs: `docker compose logs -f`

## Endpoints

Swagger documentation is available on the server on `/docs` endpoint.   
Endpoints of system are separated into 3 main groups.  
Details regarding input and output of endpoints can be found in Swagger
documentation.

### **Messages**
That group provides functionality to create messages manually filling all fields.
That group usually should be avoided in favour of `/chat` group, which provide
safer and more convenient interface for creation messages during dialog.  
Each message has `id`, `dialog_id`, `role`, `message`, `model`, `reply_to` fields
(`model` and `reply_to` are optional)


#### Create Message

Creates a new message using the provided message data.
**URL:** `/message/create`
**Method:** `POST`
**Request Body:** A `CreateMessage` object containing the message details
**Returns:** A `ViewMessage` object of the created message


#### Get Message

Retrieves a specific message by its ID.  
**URL:** `/message/get`  
**Method:** `GET`  
**Parameters:**  
- `message_id` (integer, required): The ID of the message to retrieve  

**Returns:** A `ViewMessage` object  
**Errors:** 404 if message not found  


#### Delete Message

Deletes a specific message by its ID.  
**URL:** `/message/delete`  
**Method:** `DELETE`  
**Parameters:**  
- `message_id` (integer, required): The ID of the message to delete  

**Returns:** The deleted `ViewMessage` object  
**Errors:** 404 if message not found  


### **Dialog**
That group provides functionality for managing dialogs.  
Each `dialog` has `id` and list of `messages`


#### Create Dialog

Creates a new dialog with no messages.  
**URL**: `/dialog/create_dialog`  
**Method**: `POST`  
**Parameters**: `None`  
**Returns**: A `ViewDialog` object of the created dialog  


#### Get Dialog

Retrieves information about a specific dialog.  
**URL**: `/dialog/get_dialog`  
**Method**: `GET`  
**Parameters**:
`dialog_id` (integer, required): The ID of the dialog to retrieve
**Returns**: A `ViewDialog` object  
**Errors**: `404` if dialog not found   


#### Get All Dialogs

Retrieves a list of all dialogs in the system.  
**URL**: `/dialog/get_existing`  
**Method**: `GET`  
**Parameters**: `None`  
**Returns**: A list of `ViewDialog` objects  


#### Get Dialog History

Retrieves message history from a specific dialog.  
**URL**: `/dialog/get_history`  
**Method**: `GET`  
**Parameters**:  
- `dialog_id` (integer, required): The ID of the dialog  
- `amount` (integer, optional): Number of most recent messages to retrieve. If not provided, returns all messages.  

**Returns**: A list of `ViewMessage` objects  
**Errors**: `404` if dialog not found  


#### Delete Dialog

Deletes a specific dialog from the system.  
**URL**: `/dialog/delete_dialog`  
**Method**: `DELETE`  
**Parameters**:  
- `dialog_id` (integer, required): The ID of the dialog to delete  

**Returns**: The deleted `ViewDialog` object  
**Errors**: `404` if dialog not found  


### **Chat**
That group provides functionality for chatting with LLM models


#### Create User Message

Creates a new user message in the specified dialog.  
**URL:** `/chat/create_message`  
**Method:** `POST`  
**Request Body:**
- `dialog_id` (integer, required): The ID of the dialog
- `message` (string, required): The content of the user message

**Returns:** A `ViewMessage` object of the created message
**Errors:**
- `404` if dialog not found
- `400` if the last message in the dialog is already a user message


#### Generate AI Response

Generates an AI response to the most recent user message in the specified dialog.  
**URL:** `/chat/chat_completion`  
**Method:** `GET`  
**Parameters:**
- `dialog_id` (integer, required): The ID of the dialog
- `model` (Models enum, required): The AI model to use for generating the response

**Returns:** A `ViewMessage` object containing the AI response
**Errors:**
- 404 if dialog not found
- 400 if the last message is already an AI reply


#### Get Message History (Deprecated)

Retrieves message history from a specific dialog. This endpoint is deprecated in favor of `/dialog/get_history`.
**URL:** `/chat/get_history`
**Method:** `GET`
**Parameters:**
- `dialog_id` (integer, required): The ID of the dialog
- `amount` (integer, default=0): Number of most recent messages to retrieve. If 0, returns all messages.

**Returns:** A list of `ViewMessage` objects
**Errors:** 404 if dialog not found


#### Delete Message

Deletes a specific user message.
**URL:** `/chat/delete_message`
**Method:** `DELETE`
**Parameters:**
- `message_id` (integer, required): The ID of the message to delete

**Returns:** The `ViewMessage` of deleted message  
**Errors:**
- 404 if message not found
- 400 if trying to delete a non-user message


#### Regenerate AI Response

Regenerates an AI response for a specific message.

**URL:** `/chat/regenerate`
**Method:** `POST`
**Parameters:**
- `message_id` (integer, required): The ID of the AI response message to regenerate

**Returns:** A `ViewMessage` object containing the newly generated AI response
**Errors:**
- 404 if message not found
- 400 if the message is not a response
