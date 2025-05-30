# Use AWS Lambda Python base image for Python 3.10
FROM public.ecr.aws/lambda/python:3.10

# Copy application code and install dependencies
COPY ./app ${LAMBDA_TASK_ROOT}/app
COPY requirements.txt .
RUN pip install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

# Set the Lambda entry point to FastAPI app (via Mangum handler)
CMD ["app.main.handler"]
