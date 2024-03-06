import React, { useState, useEffect } from 'react';

// Create an editable cell renderer
const EditableCell = ({
  value: initialValue,
  row: { index },
  column: { id },
  updateMyData, // This is a custom function that we supplied to our table instance
}) => {
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue)

  const onChange = e => {
    setValue(e.target.value)
  }

  // We'll only update the external data when the input is blurred
  const onBlur = () => {
    updateMyData(index, id, value)
  }

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return <input className="edit" value={value} onChange={onChange} onBlur={onBlur} style={{ fontSize: '13px', fontWeight: 'bold', width:'49px', height:"22px", color: '#00f7ff' }} />
}

export const COLUMNS = [
  {
    Header: "Time",
    accessor: "time",
  },
  {
    Header: "I/F",
    accessor: "can",
    disableSortBy: true,
  },
  {
    Header: "ID",
    accessor: "id",
    enableSorting: true,
  },
  {
    Header: "MSG",
    accessor: "ecu",
  },
  {
    Header: "0-7",
    accessor: "dt1",
    disableSortBy: true,
    Cell: EditableCell,
  },
  {
    Header: "08-15",
    accessor: "dt2",
    disableSortBy: true,
    Cell: EditableCell,
  },
  {
    Header: "16-23",
    accessor: "dt3",
    disableSortBy: true,
    Cell: EditableCell,
  },
  {
    Header: "24-31",
    accessor: "dt4",
    disableSortBy: true,
    Cell: EditableCell,
  },
  {
    Header: "32-39",
    accessor: "dt5",
    disableSortBy: true,
    Cell: EditableCell,
  },
  {
    Header: "40-47",
    accessor: "dt6",
    disableSortBy: true,
    Cell: EditableCell,
  },
  {
    Header: "48-55",
    accessor: "dt7",
    disableSortBy: true,
    Cell: EditableCell,
  },
  {
    Header: "56-63",
    accessor: "dt8",
    disableSortBy: true,
    Cell: EditableCell,
  },
  {
    Header: "Values",
    accessor: "values",
    disableSortBy: true,
  },
];