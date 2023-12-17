import React, {useEffect, useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import * as XLSX from 'xlsx';

interface AudioDetailsDto {
    filename?: string;
    overall_tempo?: number;
    peak_1?: number;
    peak_2?: number;
}

function App() {
    const [fileFromInput, setFileFromInput] = useState('');
    const [previousResponses, setPreviousResponses] = useState<AudioDetailsDto[]>([]);

    const onFileChange = (event : any) => {
        setFileFromInput(event.target.files[0]);
    }

    const handleSubmit = async (event: any) => {
        if (!fileFromInput) {
            alert("Please select a file");
            return;
        }
        event.preventDefault();

        const fd = new FormData();
        const urlUpload = "http://localhost:8086/api/file_tempo";
        const urlInsert = "http://localhost:7000/api/insert";

        fd.append("my_audio_file", fileFromInput);

        try {
            const responseUpload = await axios.post(urlUpload, fd, {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            });
            console.log(responseUpload.data);
            const responseInsert = await axios.post(urlInsert, responseUpload.data);
            console.log("Response from server: " + JSON.stringify(responseInsert.data));
        } catch (error) {
            console.error("Error while inserting:", error);
        }
    };

    const fetchResponses = async () => {
        const url = "http://localhost:7000/api/get-audio-list";

        try {
            const fetchResponse = await axios.get(url);
            setPreviousResponses(fetchResponse.data);
            console.log("Fetched: " + JSON.stringify(fetchResponse.data));
        } catch (error) {
            console.log("Error while fetching:", error);
        }
    }

    useEffect(() => {
        fetchResponses();
    }, []);

    const handleExport = () => {
        const worksheet = XLSX.utils.json_to_sheet(previousResponses);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Responses');
        XLSX.writeFile(workbook, 'responses.xlsx');
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <form onSubmit={handleSubmit} className="mb-4">
                        <h1 className="text-center mb-4">.wav File Upload</h1>
                        <div className="mb-3">
                            <input type="file" className="form-control" onChange={onFileChange} />
                        </div>
                        <button type="submit" className="btn btn-primary">Upload</button>
                    </form>
                </div>
            </div>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <h2 className="mb-3">All Files</h2>
                        <table className="table">
                            <thead>
                            <tr>
                                <th>File Name:</th>
                            </tr>
                            </thead>
                            <tbody>
                            {previousResponses.map((file, index) => (
                                <tr key={index}>
                                    <td>{file.filename}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <button className="btn btn-success mt-3" onClick={handleExport}>
                            Export to Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>


  );
}

export default App;
