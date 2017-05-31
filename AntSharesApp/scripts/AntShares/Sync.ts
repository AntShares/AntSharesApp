﻿namespace AntShares
{
    export class Sync
    {
        private static callNode(node: string): PromiseLike<Map<boolean, string>> {
            let dictionary = new Map<boolean, string>();
            let rpcClient = new AntShares.Network.RPC.RpcClient(node);
            return rpcClient.call("getblockcount", []).then(result => {
                dictionary.set(true, node);
                return Promise.resolve(dictionary);
            }, reject => {
                dictionary.set(false, node);
                return Promise.resolve(dictionary);
            });
        }

        public static connectNode(isMainNet: boolean): void {
            console.log("启动连接");
            Promise.resolve(1).then(() => {
                let promises = [];
                let nodeList: string[] = new Array<string>();

                if (isMainNet) {
                    if (isMobileApp.App()) {
                        //MainNet App https&http
                        nodeList = Global.mainHttpsNetList.concat(Global.mainHttpNetList);
                    } else {
                        //MainNet PC Web https
                        nodeList = Global.mainHttpsNetList;
                    }
                } else {
                    //TestNet
                    nodeList = Global.testNetList;
                }
                for (let i = 0; i < nodeList.length; i++) {
                    promises[i] = Sync.callNode(nodeList[i]);
                }
                return Promise.all(promises);
            }).then(results => {
                let node: string;
                for (let i = 0; i < results.length; i++) {
                    if ((<any>results[i]).has(true)) {
                        //console.log((<any>results[i]).get(true));
                        Global.isConnected = true;
                        node = (<any>results[i]).get(true);
                        break;
                    }
                }
                if (Global.isConnected) {
                    if (Global.RpcClient == null) {
                        console.log(5);
                        Global.RpcClient = new Network.RPC.RpcClient(node);
                        Global.Blockchain = Core.Blockchain.registerBlockchain(new Implementations.Blockchains.RPC.RpcBlockchain(Global.RpcClient));
                        Global.Node = new Network.RemoteNode(Global.RpcClient);
                    } else {
                        console.log(6);
                        console.log(Global.RpcClient.Url);
                        if (Global.RpcClient.Url != node) {
                        console.log(7);
                            Global.RpcClient = new Network.RPC.RpcClient(node);
                            Global.Blockchain = Core.Blockchain.registerBlockchain(new Implementations.Blockchains.RPC.RpcBlockchain(Global.RpcClient));
                            Global.Node = new Network.RemoteNode(Global.RpcClient);
                        }
                    }
                } else {
                    throw new Error("网络连接中断333");
                }
                }).then(success => {
                    console.log(Global.RpcClient.Url);
                return Global.Blockchain.getBlockCount();
            }).then(result => {
                let remoteHeight = result - 1;
                $(".remote_height").text(remoteHeight);
                if (Global.Wallet) {
                    let localHeight = (Global.Wallet as any).walletHeight - 1;
                    let process = (localHeight / remoteHeight * 100).toFixed(1);
                    $(".progress-bar").css("width", process + "%");
                    $(".progress-bar").attr("aria-valuenow", process + "%");
                    $(".local_process").text(process);
                    $(".local_height").text(localHeight);
                    console.log(localHeight);
                }
            }).then(() => {
                return delay(AntShares.Core.Blockchain.SecondsPerBlock * 1000).then(() => {
                    return AntShares.Sync.connectNode(Global.isMainNet);
                });
            }).catch(error => {
                console.log("网络连接中断");
                return delay(Global.reConnectMultiplier * 1000).then(() => {
                    return AntShares.Sync.connectNode(Global.isMainNet);
                });
            });

        }

    }

    AntShares.Sync.connectNode(Global.isMainNet);
}
