import { useEffect, useState } from 'react';
import './frontend.scss';

const FrontendTable = ({ tableBodyColor, textColor, visibleColumns }) => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/wp-json/ashutosh-task/v1/fetch-data')
            .then(response => response.json())
            .then(setData)
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            {data ? (
                <table
                    style={{
                        // borderColor: borderColor,
                        color: textColor,
                        backgroundColor: tableBodyColor,
                    }}
                    className="ashutosh-task-table"
                >
                    <thead>
                        <tr>
                            {visibleColumns.map((column) => (
                                <th key={column}>{column}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.values(data.data.rows).map((row) => (
                            <tr key={row.id}>
                                {visibleColumns.includes('id') && <td>{row.id}</td>}
                                {visibleColumns.includes('fname') && <td>{row.fname}</td>}
                                {visibleColumns.includes('lname') && <td>{row.lname}</td>}
                                {visibleColumns.includes('email') && <td>{row.email}</td>}
                                {visibleColumns.includes('date') && <td>{row.date}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>Loading data from API...</p>
            )}
        </div>
    );
};

export default FrontendTable;
