````mermaid
graph TD
    subgraph Origami_Image_Service
        OIS[Origami Image Service Processes]
        IIS[Internally stored image sets]
    end

    FT[FT Customer] --> CLC[Customer's client]
    CLC --> FLY[Fastly]
    FLY --> OIS
    OIS --> IIS
    OIS --> IMG[Image sources]
    OIS --> CLN[Cloudinary]
    CLN --> OIS
    OIS --> CLN

    FT -->|View FT content| CLC
    CLC -->|Request image with transformations| FLY
    FLY -->|Forwards request if not cached| OIS
    OIS -->|Requests an image| IIS
    OIS -->|Retrieves image from source| IMG
    OIS -->|Uploads image| CLN
    OIS -->|Requests image with transforms| CLN

    subgraph Legend
        L1[Black: Actors]
        L2[Grey: Container]
    end
```mermaid
````
