import React, { useEffect, useState } from 'react'
import { useHistory, useRouteMatch, useLocation, Route } from 'react-router-dom'
import { DataGrid, GridActionsCellItem, GridToolbarFilterButton, GridToolbarExport } from '@mui/x-data-grid'
import { columns } from '../../constants/user_metadata/table_columns_data'
import userMetadataKeyServices from '../../service'
import { Pagination, CircularProgress, Button } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import service from '../../service'
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

function UserMetadataKeyList() {
  const history = useHistory()
  const match = useRouteMatch()
  const url = match.url
  const location = useLocation()
  const [sortModel, setSortModel] = useState([])
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [userMetadataKey, setUserMetadataKey] = useState([])
  const [count, setCount] = useState(0)
  useEffect(() => {
    const column = {
      field: 'actions',
      headerName: 'Aksiyonlar',
      type: 'actions',
      width: 150,
      getActions: (params) => [
        <ButtonPermission
          permission="USER_METADATA_KEY_UPDATE"
          grid
          icon={<EditIcon />}
          onClick={() => editUserMetadataKey(params)}
          label="Delete"
        ></ButtonPermission>,
        <ButtonPermission
          permission="USER_METADATA_KEY_DELETE"
          grid
          icon={<DeleteIcon />}
          onClick={() => deleteUserMetadataKey(params)}
          label="Delete"
        ></ButtonPermission>
      ]
    }
    columns.unshift(column)
  }, [])

  useEffect(() => {
    getData()
  }, [page, sortModel, location])

  function editUserMetadataKey(params) {
    const userMetadataKeyId = params.id
    history.push(`${BASE_PATH}user-metadata-key/edit/${userMetadataKeyId}`)
  }

  async function deleteUserMetadataKey(params) {
    const userMetadataKeyId = params.id
    await service.deleteUserMetadataKey(userMetadataKeyId)
    getData()
  }

  async function getData() {
    setIsLoading(true)
    const { field, sort } = sortModel.length > 0 ? sortModel[0] : { field: 'createdAt', sort: 'desc' }
    const payload = {
      size: 10,
      page: page,
      sort: `${field},${sort}`
    }
    const result = await userMetadataKeyServices.getUserMetaDataKeys(payload)
    const { data, properties } = result.data
    setCount(properties.totalPages)
    setUserMetadataKey(data)
    setIsLoading(false)
  }

  function paginationChange(_, e_page) {
    setPage(e_page - 1)
  }

  function goCreate() {
    history.push(`${BASE_PATH}user-metadata-key/create`)
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
    <div className="user-metadata-key-list">
      {isLoading ? (
        <CircularProgress className="user-metadata-key-list-circular-progress" />
      ) : (
        <div className="user-metadata-key-list-table-area">
          <div className="user-metadata-key-list-table-area-header">
            <ButtonPermission
              permission="USER_METADATA_KEY_CREATE"
              variant="outlined"
              startIcon={<Add />}
              size="small"
              onClick={goCreate}
            >
              KULLANICI ALTBİLGİ KEY EKLE
            </ButtonPermission>
          </div>

          <DataGrid
            components={{ Toolbar: Header, NoRowsOverlay: CustomNoRowsOverlay, FilterPanel: CustomFilterPanel }}
            rows={userMetadataKey}
            columns={columns}
            rowHeight={35}
            headerHeight={35}
            autoHeight
            hideFooter
            showColumnRightBorder
            sortingMode="server"
            className="user-metadata-key-list-table-area-table"
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
          <div className="user-metadata-key-list-table-area-pagination">
            <Pagination page={page + 1} onChange={paginationChange} count={count} color="primary" size="small" />
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMetadataKeyList
