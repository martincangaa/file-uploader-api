# File Uploader API

### Starting the API.
Command to run the API
```
docker compose up
```
Once the API is successfully running, a message like this will be displayed:
```
HTML-upload API listening on http://localhost:3000
Generated JWT API Token: JWT_API_TOKEN
```

#### How to use the API.
Example curl command to upload a file:
```
culr -X POST http://localhost:3000/upload -H "Authorization: Bearer JWT_API_TOKEN" -F "file=@PATH_TO_FILE"
```
#### How to change the Token.
Change the JWT_SECRET inside the **.env** file in (./src) and restart the container.

<br><br>
> This is my first JavaScript program 😃
