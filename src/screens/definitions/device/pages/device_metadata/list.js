import React, { useEffect, useState } from 'react'
import { useHistory, useRouteMatch, useLocation } from 'react-router-dom'
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarDensitySelector,
  GridToolbarFilterButton,
  GridToolbarExport
} from '@mui/x-data-grid'
import { columns } from '../../constants/device_metadata/table_columns_data'
import devicesServices from '../../service' //??
import { Pagination, CircularProgress, Button, IconButton, TextField } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import service from '../../service' //UNUTMA!!
import Add from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import './style.scss'
import { CustomNoRowsOverlay, CustomFilterPanel, ButtonPermission } from 'components'
import { BASE_PATH } from '../../routes'

function Header(props) {
  return (
    <div className="table-header">
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </div>
  )
}

function DeviceMetadataList() {
  const history = useHistory()
  const { url } = useRouteMatch()
  const location = useLocation()
  const [sortModel, setSortModel] = useState([])
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [deviceMetadas, setDeviceMetadas] = useState([])
  const [count, setCount] = useState(0)
  useEffect(() => {
    const column = {
      field: 'actions',
      headerName: 'Aksiyonlar',
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <ButtonPermission permission="DEVICE_METADATA_UPDATE" grid icon={<EditIcon />} onClick={() => editDeviceMetadata(params)} label="Edit"></ButtonPermission>,
        <ButtonPermission permission="DEVICE_METADATA_DELETE" grid 
          icon={<DeleteIcon />}
          onClick={() => deleteDeviceMetadata(params)}
          label="Delete"
        ></ButtonPermission>
      ]
    }
    columns.unshift(column)
  }, [])

  useEffect(() => {
    getData()
  }, [page, sortModel, location])

  function editDeviceMetadata(params) {
    const id = params.id
    history.push(`${BASE_PATH}device-metadata/edit/${id}`)
  }

  async function deleteDeviceMetadata(params) {
    const deviceMetadataId = params.id
    await service.deleteDeviceMetadata(deviceMetadataId)
    getData()
  }

  async function getData() {
    setIsLoading(true)
    const { field, sort } = sortModel.length > 0 ? sortModel[0] : { field: 'createdAt', sort: 'desc' }
    const params = {
      size: 10,
      page: page,
      sort: `${field},${sort}`
    }
    const result = await devicesServices.getDeviceMetadatas(params)
    const data = result?.data?.data
const properties = result?.data?.properties
    setCount(properties.totalPages)
    setDeviceMetadas(data)
    setIsLoading(false)
  }

  function paginationChange(_, e_page) {
    setPage(e_page - 1)
  }

  function goCreate() {
    history.push(`${BASE_PATH}device-metadata/create`)
  }

  function filter(by, searchText) {
    switch (by) {
      case 'dataProtocol':
        console.log('----dataProtocol', searchText)
        break
      case 'dataProtocolVersion':
        console.log('----dataProtocolVersion', searchText)
        break
      default:
        break
    }
  }

  return (
    <div className="device-metadata-list">
      {isLoading ? (
        <CircularProgress className="device-metadata-list-circular-progress" />
      ) : (
        <div className="device-metadata-list-table-area">
          <div className="device-metadata-list-table-area-header">
            <ButtonPermission
              permission="DEVICE_METADATA_CREATE"
              variant="outlined"
              startIcon={<Add />}
              size="small"
              onClick={goCreate}
            >
              Yeni Cihaz Albilgisi Ekle
            </ButtonPermission>
          </div>

          <DataGrid
            components={{ Toolbar: Header, NoRowsOverlay: CustomNoRowsOverlay, FilterPanel: CustomFilterPanel }}
            rows={deviceMetadas}
            columns={columns}
            rowHeight={35}
            headerHeight={35}
            autoHeight
            hideFooter
            showColumnRightBorder
            sortingMode="server"
            className="device-metadata-list-table-area-table"
            disableColumnMenu
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            componentsProps={{
              filterPanel: {
                value: columns,
                filter: filter
              }
            }}
          />
          <div className="device-metadata-list-table-area-pagination">
            <Pagination page={page + 1} onChange={paginationChange} count={count} color="primary" size="small" />
          </div>
        </div>
      )}
    </div>
  )
}

export default DeviceMetadataList
