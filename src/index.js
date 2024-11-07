import { registerBlockType } from '@wordpress/blocks';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';


import { PanelBody, ColorPalette, CheckboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';


import { useEffect, useState } from 'react';
import './index.scss';

const colors = [
    { name: 'Red', color: '#FF474C' },
    { name: 'Green', color: '#90EE90' },

    
    { name: 'Purple', color: '#B19CD9' },
    { name: 'Black', color: '#000' },
    // { name: 'Orange', color: '#000' },

    { name: 'Gray', color: '#D3D3D3' },
];

const columns = ['id', 'fname', 'lname', 'email', 'date'];

registerBlockType('ashutosh-task/data-block', {
    title: __('Ashutosh Rode Task - Display API Data', 'ashutosh-task'),

    icon: 'database',
    category: 'widgets',

    attributes: {
        tableBodyColor: { type: 'string', default: '#ade48e' },
        textColor: { type: 'string', default: '#000' },

        visibleColumns: { type: 'array', default: columns }
    },

    edit({ attributes, setAttributes }) {
        const blockProps = useBlockProps();

        const [data, setData] = useState(null);

        useEffect(() => {
            fetch('/wp-json/ashutosh-task/v1/fetch-data')
                .then(response => response.json())
                .then(setData)
                .catch(error => console.error('Error fetching data:', error));
        }, []);

        const toggleColumn = (column) => {
            const newColumns = attributes.visibleColumns.includes(column)
                ? attributes.visibleColumns.filter(c => c !== column)
                : [...attributes.visibleColumns, column];
            setAttributes({ visibleColumns: newColumns });
        };

        return (
            <div {...blockProps}>
                <InspectorControls>
                    <PanelBody title={__('Table Styles', 'ashutosh-task')}>
                        <p>Table Body Color</p>

                        <ColorPalette title={__('Table Body Color', 'ashutosh-task')}
                            colors={colors}
                            value={attributes.tableBodyColor}
                            onChange={(color) => setAttributes({ tableBodyColor: color })}
                        />
                        <p>Text Color</p>
                        <ColorPalette
                            colors={colors}
                            value={attributes.textColor}

                            onChange={(color) => setAttributes({ textColor: color })}
                        />

                    </PanelBody>
                    <PanelBody title={__('Column Visibility', 'ashutosh-task')}>
                        {columns.map(column => (
                            <CheckboxControl
                                label={column}
                                checked={attributes.visibleColumns.includes(column)}

                                onChange={() => toggleColumn(column)}
                            />
                        ))}
                    </PanelBody>
                </InspectorControls>
                {data ? (
                    <table

                        style={{ color: attributes.textColor, backgroundColor: attributes.tableBodyColor }} className="ashutosh-task-table">
                        <thead>


                            <tr>{columns.filter(col => attributes.visibleColumns.includes(col)).map(col => <th key={col}>{col}</th>)}</tr>
                        </thead>
                        <tbody>
                            {Object.values(data.data.rows).map(row => (
                                <tr key={row.id}>
                                    {attributes.visibleColumns.includes('id') && <td>{row.id}</td>}
                                    {attributes.visibleColumns.includes('fname') && <td>{row.fname}</td>}
                                    
                                    {/* {attributes.visibleColumns.includes('lname') && <td>{row.name}</td>} */}
                                    
                                    {attributes.visibleColumns.includes('lname') && <td>{row.lname}</td>}
                                   
                                   
                                    {attributes.visibleColumns.includes('email') && <td>{row.email}</td>}
                                    {attributes.visibleColumns.includes('date') && <td>{row.date}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Loading data from API...</p>
                )}
            </div>
        );
    },

    save() {
        
        return null;
    }
});