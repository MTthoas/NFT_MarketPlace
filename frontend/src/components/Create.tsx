import React, { useState, useEffect } from "react";
import { useAccount, useBalance } from "wagmi";
import { ethers } from "ethers";
import MarketPlace from "../contracts/marketplace.json";
import { uploadFileToIPFS } from "../pinata";
import axios from "axios";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const contract = new ethers.Contract(
  MarketPlace.address,
  MarketPlace.abi as any,
  signer
);

function Create() {
  const { address } = useAccount();
  const {
    data: balanceData,
    isError: balanceError,
    isLoading: balanceLoading,
  } = useBalance({ address: address });

  const [nfts, setNfts] = useState<
    {
      tokenId: number;
      owner: string;
      seller: string;
      price: number;
      currentlyListed: boolean;
    }[]
  >([]);

  const [tokenURI, setTokenURI] = useState("");
  const [price, setPrice] = useState(0);

  const [file, setFile] = useState<File | null>(null);
  const [tokenPrice, setTokenPrice] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setFile(event.target.files[0]);
    }
  };

  const JWT =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjN2U5ZjAyYy04MzAzLTRjOGYtOWIwZC0xMzQ1YWI5MDlmMjIiLCJlbWFpbCI6Im1hbHRoYXphcjIyN0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZGM0MTUyYzk5YThhYTI0ZmEzMjIiLCJzY29wZWRLZXlTZWNyZXQiOiJhZmZlYzRiZDQ2ZGE1NjUzZWMyMWE3ZGU4Nzc0OGZlNThlNzVmYTI4MWI0YjczZjBmYzVjMzcxYjIxYmEzOGFjIiwiaWF0IjoxNjg2MjYwNTI2fQ.GwwGHhM8E6ZN_YnMtJIqIB8KVArhxFmc-0Uq5h5it88";

  const createNewNFT = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post(
          "https://api.pinata.cloud/pinning/pinFileToIPFS",
          formData,
          {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${JWT}`,
            },
          }
        );

        if (res.data.IpfsHash) {
          const attributes = [
            {
              trait_type: "Breed",
              value: "Maltipoo",
            },
            {
              trait_type: "Eye color",
              value: "Mocha",
            },
          ];
          const description = `${tokenDescription}`;
          const image = `${res.data.IpfsHash}`;
          const name = `${tokenName}`;

          const tokenURI = JSON.stringify({
            attributes,
            description,
            image,
            name,
          });

          const priceInWei = ethers.utils.parseEther(tokenPrice);

          const transaction = await contract.createToken(tokenURI, priceInWei);
          await transaction.wait();

          console.log("NFT created successfully");
        }
      } catch (error: any) {
        if (error.message) {
          console.log(error.message);
        }
        if (error.response) {
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log("Error", error.message);
        }
      }

      setFile(null);
      setTokenPrice("");
    }
  };

  return (
    <div className="flex max-w-4xl mx-auto lg:my-10 md:my-8 my-6 lg:px-10 md:px-8 px-6 justify-center">
      {address ? (
        <div>
          {/* Title */}
          <div className="mb-6">
            <h1 className="font-bold text-2xl md:text-3xl">Create New NFT</h1>
            <h3 className="font-semibold mt-2 text-slate-600">
              Single edition on Etherum
            </h3>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left */}
            <div className="col-span-1 md:col-span-2 flex flex-col justify-center">
              {/* Address */}
              <div className="mb-8 flex flex-row place-items-center border border-gray-400 p-4 rounded-xl border-solid">
                <div>
                  <img
                    className="w-10"
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyMSAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTAuNSAyMS41QzQuNzAxMDEgMjEuNSAwIDE2Ljc5OSAwIDExQzAgNS4yMDA5OCA0LjcwMTAxIDAuNDk5OTY5IDEwLjUgMC40OTk5NjlDMTYuMjk5IDAuNDk5OTY5IDIxIDUuMjAwOTggMjEgMTFDMjEgMTYuNzk5IDE2LjI5OSAyMS41IDEwLjUgMjEuNVoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8zMTIxXzk1MDIpIi8+CiAgPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNC42MDEgMTEuMTJMMTAuNDk5NyA0LjQzNzQ3TDYuMzk5OTMgMTEuMTJMMTAuNDk5NyAxMy41Mjg5TDE0LjYwMSAxMS4xMlpNMTQuNjAxMSAxMS44ODU2TDEwLjQ5OTcgMTQuMjYzMUw2LjM5NzIzIDExLjg4MzJMMTAuNDk5NyAxNy41NTlMMTQuNjAxMSAxMS44ODU2WiIgZmlsbD0iI0ZERkVGRSIvPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzMxMjFfOTUwMiIgeDE9IjEwLjUiIHkxPSIwLjQ5OTk2OSIgeDI9IjEwLjUiIHkyPSIyMS41IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiM2QjhDRUYiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNkI3MEVGIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KPC9zdmc+Cg=="
                    alt="ETH logo"
                  />
                </div>
                <div className="w-full ml-4">
                  <div className="flex grow justify-between">
                    <p className="font-bold text-lg">0xdd8...e4d8</p>
                    <div>
                      <div className="px-1.5 py-1 rounded bg-green-200/[.5]">
                        <p className="text-green-500 text-xs font-medium leading-4">
                          Connected
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ethereum</p>
                  </div>
                </div>
              </div>

              {/* Upload file */}
              <div className="mb-8">
                <p className="mb-2 font-bold text-lg">Upload file</p>
                <div className="place-items-center grid border border-gray-400 p-16 rounded-xl border-dashed">
                  <svg
                    className="w-12 h-12 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <span className="mt-4 mb-2 text-grey font-semibold text-xl">
                    JPG, PNG, GIF. Max 10mb.
                  </span>
                  <input
                    type="file"
                    onChange={onFileChange}
                    className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-black-50 file:text-black-700
                            hover:file:bg-black-100"
                  />
                </div>
              </div>

              {/* Inputs */}
              <div className="">
                <div className="grid mb-4">
                  <label className="mb-1 font-bold text-base">Name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Mon premier NFT"
                    className="border-2 hover:border-gray-400 border-transparent px-4 py-2 rounded-xl transition-colors"
                  />
                </div>
                <div className="grid mb-4">
                  <label className="mb-1 font-bold text-base">Price</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={tokenPrice}
                    onChange={(e) => setTokenPrice(e.target.value)}
                    placeholder="Price in Ether"
                    className="border-2 hover:border-gray-400 border-transparent px-4 py-2 rounded-xl transition-colors"
                  />
                </div>
                <div className="grid mb-4">
                  <label className="mb-1 font-bold text-base">
                    Description
                  </label>
                  <input
                    type="text"
                    value={tokenDescription}
                    onChange={(e) => setTokenDescription(e.target.value)}
                    placeholder="NFT Description"
                    className="border-2 hover:border-gray-400 border-transparent px-4 py-2 rounded-xl transition-colors"
                  />
                </div>
                <button
                  onClick={createNewNFT}
                  className="mt-6 bg-black text-white font-semibold py-3 px-12 rounded-xl"
                >
                  Create NFT
                </button>
              </div>
            </div>

            {/* Right */}
            <div className="hidden md:block">
              <div className="grid sticky top-24">
                <p className="mb-2 font-bold text-lg">Preview</p>
                <div className="min-h-[383px]">
                  <div className="h-full py-6 px-8 text-center justify-center items-center grow flex flex-col border rounded-xl border-gray-400">
                    <p className="text-sm text-slate-600">Upload file and choose collection to preview your brand new NFT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Create;
