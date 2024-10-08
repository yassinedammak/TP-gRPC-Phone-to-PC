import grpc
from concurrent import futures
import time
import helloworld_pb2
import helloworld_pb2_grpc

class HelloWorldServicer(helloworld_pb2_grpc.HelloWorldServicer):
    def SayHelloStream(self, request, context):
        # Set the greeting message based on the language
        if request.language == "fr":
            message = f"Bonjour {request.name}!"
        elif request.language == "ar":
            message = f"مرحبا {request.name}!"
        else:
            message = f"Hello {request.name}!"

        # Print output indicating streaming has started
        print(f"Starting to stream messages to {request.name} in {request.language}...")

        counter = 1
        # Stream the message continuously every second
        while True:
            yield helloworld_pb2.HelloReply(message=f"{message} - Message {counter}")
            time.sleep(1)  # Wait for 1 second before sending the next message
            counter += 1
            
            if context.is_active() is False:
                print("Client disconnected.")
                break

def serve():
    # Set up the gRPC server
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    helloworld_pb2_grpc.add_HelloWorldServicer_to_server(HelloWorldServicer(), server)
    server.add_insecure_port('[::]:50051')  # Listen on all interfaces (IPv4 and IPv6)
    server.start()
    print("Server is running on port 50051...")
    server.wait_for_termination()

if __name__ == '__main__':
    serve()

