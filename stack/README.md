##############################################################################################
|                    Browser                                                                 |
|                     /  \                                                                   |
|JSIPFS Client(Custom)    IPFS ServiceWorker{ipfs-postmsg-proxy(C) <=> ipfs-postmsg-proxy(S)}|
|                     \  /                                                                   |
|           Embedded JSIPFS Node(Custom) <=> {Embedded Backend Repositories}                 |
#######################||#####################################################################
                       ||
jsipfs@local, goipfs@local, goipfs@remote, ..., {The Rest of the World}