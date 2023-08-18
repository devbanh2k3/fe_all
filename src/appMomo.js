import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './appmomo.css';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
function DataTable() {
    const [dataAll, setDataAll] = useState([]);
    const [Arraydata, setArraydata] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    let datapush = []
    async function fetchDataSequentially(index) {

        if (index >= Arraydata.length) {
            // Khi đã hoàn thành tất cả các yêu cầu, cập nhật state và kết thúc hàm.
            console.log('datâll', datapush);
            setDataAll(datapush);
            setIsLoading(false);
            return;
        }

        const item = Arraydata[index];
        const url = 'https://server-zalo.onrender.com/get-data';
        const requestData = { username: item.username, password: item.password };

        try {
            const response = await axios.post(url, requestData);
            datapush.push(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }

        // Tiếp tục với yêu cầu kế tiếp sau một khoảng thời gian (ví dụ: 1 giây)
        setTimeout(() => {
            fetchDataSequentially(index + 1);
        }, 1000); // Đợi 1 giây trước khi thực hiện yêu cầu tiếp theo
    }

    const handleStartClick = async () => {
        try {
            setIsLoading(true);
            setDataAll([]);
            datapush = [];
            await fetchDataSequentially(0);

        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoading(false);
        }
    };
    const handleStartClickx = async () => {
        try {
            const canvas = await generateCanvas();
            //const resizedCanvas = await resizeCanvas(canvas, 1280, 720);
            await sendCanvasToTelegram(canvas);
            createExcelFromTable()
            alert("Đã hoàn thành!")
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleFileChange = (event) => {
        setArraydata([]);
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const fileContent = event.target.result;
            const lines = fileContent.split('\n');
            const newData = lines.map(line => {
                const [username, password] = line.replace('\r', '').split('|'); // Loại bỏ dấu \r
                return { username, password };
            });
            setArraydata(newData);
        };

        reader.readAsText(file);
        alert("Thêm file thành công");
        console.log(Arraydata)

    };

    const generateCanvas = async () => {
        const table = document.getElementById('data-table'); // ID của thẻ bảng trong JSX
        const canvas = await html2canvas(table);

        const targetDayIndex = 4; // Chỉ số cột muốn chụp (cột thứ 4)
        const columnsToCapture = table.getElementsByTagName('th').length <= targetDayIndex + 1
            ? table.getElementsByTagName('th')
            : table.getElementsByTagName('td');

        const widthToCapture = Array.from(columnsToCapture)
            .slice(0, targetDayIndex + 1)
            .reduce((totalWidth, column) => totalWidth + column.offsetWidth, 0);

        const canvasWidth = Math.min(canvas.width, 1200);

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = canvasWidth;
        croppedCanvas.height = canvas.height;

        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, canvasWidth, canvas.height, 0, 0, canvasWidth, canvas.height);

        return croppedCanvas;
    };
    const sendCanvasToTelegram = async (canvas) => {
        const botToken = '6545044078:AAFMTyr1RoR2RrFXV2B9dk8mKGsTQyz38uM';
        const chatId = '1603979401';
        console.log('test', canvas)
        const imageBlob = await new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob);
            });
        });

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', imageBlob, 'screenshot.png');

        try {
            const response = await axios.post(
                `https://api.telegram.org/bot${botToken}/sendPhoto`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            console.log('Screenshot sent to Telegram:', response.data);
        } catch (error) {
            console.error('Error sending screenshot to Telegram:', error);
        }
    };


    // function createExcelFromTable() {
    //     const worksheet = XLSX.utils.table_to_sheet(document.querySelector('table'));
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    //     XLSX.writeFile(workbook, 'zalopay_data.xlsx');
    // }

    function s2ab(s) {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xff;
        }
        return buf;
    }
    const createExcelFromTable = () => {
        const worksheet = XLSX.utils.table_to_sheet(document.querySelector('table'));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        const excelBlob = new Blob([s2ab(XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' }))], {
            type: 'application/octet-stream'
        });

        //saveAs(excelBlob, 'Momo_data.xlsx');

        // Gửi file Excel lên Telegram sau khi tạo và tải xuống
        sendExcelToTelegram(excelBlob);
    };
    const sendExcelToTelegram = async (excelBlob) => {
        const botToken = '6545044078:AAFMTyr1RoR2RrFXV2B9dk8mKGsTQyz38uM';
        const chatId = '1603979401';

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('document', excelBlob, 'zalopay_data.xlsx');

        try {
            const response = await axios.post(
                `https://api.telegram.org/bot${botToken}/sendDocument`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            console.log('Excel file sent to Telegram:', response.data);
        } catch (error) {
            console.error('Error sending Excel file to Telegram:', error);
        }
    };

    const dateColumns = Array.from({ length: 30 }, (_, index) => index + 1);
    const currentDate = new Date();
    const currentDay = currentDate.getDate(); // Lấy ngày hiện tại

    const homqua = new Date();
    homqua.setDate(homqua.getDate() - 1);

    const currentDayhomqua = homqua.getDate();

    console.log('hôm qua', currentDayhomqua)
    return (
        <div className="table-container">
            <div className="button-container">
                <label className="custom-file-upload">
                    <input type="file" accept=".txt" onChange={handleFileChange} />
                    Tải lên tệp
                </label>
                <button onClick={handleStartClick}>Bắt đầu</button>
                <button onClick={handleStartClickx}>Chụp + excel và gửi</button>

            </div>


            {isLoading && <div className="loading-overlay">Đang tải...</div>}

            <table id="data-table">
                <thead>
                    <tr>
                        <th>Shop</th>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Hôm nay</th>
                        <th>Hôm qua</th>
                        {dateColumns.map((day) => (
                            <th key={day}>Ngày {day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dataAll.map((data, index) => (
                        <tr key={index}>
                            <td>Shop {index + 1}</td>
                            <td>{data[0].username}</td>
                            <td>{data[0].password}</td>
                            <td>{data[currentDay - 1]?.data?.totalSuccessAmount.toLocaleString() || 0}</td>
                            <td>{data[currentDayhomqua - 1]?.data?.totalSuccessAmount.toLocaleString() || 0}</td>
                            {dateColumns.map((day, dayIndex) => (
                                <td key={dayIndex}>
                                    {data[dayIndex] ? (data[dayIndex].data.totalSuccessAmount.toLocaleString() || 0) : 0}
                                </td>
                            ))}
                        </tr>
                    ))}




                </tbody>
            </table>
        </div>
    );
}
export default DataTable;
