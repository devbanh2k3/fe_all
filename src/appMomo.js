import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './appmomo.css';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
function DataTable() {
    const [dataAll, setDataAll] = useState([]);
    const [Arraydata, setArraydata] = useState([]);
    let datapush = []
    async function fetchDataSequentially(index) {
        if (index >= Arraydata.length) {
            // Khi đã hoàn thành tất cả các yêu cầu, cập nhật state và kết thúc hàm.
            console.log('datâll', datapush);
            setDataAll(datapush);
            return;
        }

        const item = Arraydata[index];
        const url = 'http://localhost:5000/get-data';
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
    const exportToExcel = () => {
        const chatId = '919990497'; // Thay RECIPIENT_CHAT_ID bằng ID của cuộc trò chuyện mong muốn
        const excelBuffer = createExcelFromTable();
        console.log(excelBuffer)
        sendExcelToTelegramUsingAxios(chatId, excelBuffer);
    };
    const handleStartClick = async () => {
        try {

            await fetchDataSequentially(0);

            // const canvas = await generateCanvas();
            // //const resizedCanvas = await resizeCanvas(canvas, 1280, 720);
            // await sendCanvasToTelegram(canvas);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleStartClickx = async () => {
        try {
            const canvas = await generateCanvas();
            //const resizedCanvas = await resizeCanvas(canvas, 1280, 720);
            await sendCanvasToTelegram(canvas);

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

        const canvasWidth = Math.min(canvas.width, widthToCapture);

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = canvasWidth;
        croppedCanvas.height = canvas.height;

        const ctx = croppedCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, canvasWidth, canvas.height, 0, 0, canvasWidth, canvas.height);

        return croppedCanvas;
    };
    const sendCanvasToTelegram = async (canvas) => {
        const botToken = '6423723783:AAG5_PUVkQPfacplV6stUXTt3qRUktDj7ws';
        const chatId = '919990497';
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
    function sendExcelToTelegramUsingAxios(chatId, excelBuffer) {
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('document', blob, 'table.xlsx');

        axios.post(`https://api.telegram.org/6423723783:AAG5_PUVkQPfacplV6stUXTt3qRUktDj7ws/sendDocument`, formData, {
            //headers: formData.getHeaders() // Xóa dòng này
        })
            .then(response => {
                console.log('Tệp Excel đã được gửi lên Telegram.');
            })
            .catch(error => {
                console.error('Lỗi khi gửi tệp Excel lên Telegram:', error);
            });
    }

    function createExcelFromTable() {
        const worksheet = XLSX.utils.table_to_sheet(document.querySelector('table'));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Chuyển workbook thành buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        return excelBuffer;
    }
    const dateColumns = Array.from({ length: 30 }, (_, index) => index + 1);
    const currentDate = new Date();
    const currentDay = currentDate.getDate(); // Lấy ngày hiện tại
    console.log(currentDay)
    return (
        <div className="table-container">

            <input type="file" accept=".txt" onChange={handleFileChange} />
            <button onClick={handleStartClick}>Bắt đầu</button>
            <button onClick={handleStartClickx}>test</button>
            <button onClick={exportToExcel}>excel</button>
            <table id="data-table">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Today</th>
                        {dateColumns.map((day) => (
                            <th key={day}>Ngày {day}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {dataAll.map((data, index) => (
                        <tr key={index}>
                            <td>{data[0].username}</td>
                            <td>{data[0].password}</td>
                            <td>{data[currentDay - 1]?.data?.totalSuccessAmount || 0}</td>
                            {dateColumns.map((day, dayIndex) => (
                                <td key={dayIndex}>
                                    {data[dayIndex] ? (data[dayIndex].data.totalSuccessAmount || 0) : 0}
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
