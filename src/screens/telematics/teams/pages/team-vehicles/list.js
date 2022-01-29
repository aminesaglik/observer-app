import React, { useEffect, useState } from 'react'
import {
    useHistory, useRouteMatch, useLocation
} from "react-router-dom";
import {
    DataGrid, GridActionsCellItem, GridToolbarDensitySelector,
    GridToolbarFilterButton, GridToolbarExport
} from '@mui/x-data-grid';
import { columns } from '../../constants/team-vehicles/table_columns_data'
import teamVehiclesServices from '../../service';
import { Pagination, CircularProgress, Button, IconButton, TextField } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit';
import service from '../../service';
import Add from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import './style.scss'
import { CustomNoRowsOverlay, CustomFilterPanel, ButtonPermission } from 'components'
import { NotificationManager } from 'react-notifications';

function Header(props) {
    return (
        <div className="table-header">
            <GridToolbarFilterButton />
            <GridToolbarExport />
        </div>
    );
}

function TeamVehicles() {
    const history = useHistory();
    const match = useRouteMatch();
    const url = match.url
    const location = useLocation()
    const [sortModel, setSortModel] = useState([])
    const [page, setPage] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [teamVehicles, setTeamVehicles] = useState([])
    const [count, setCount] = useState(0)

    useEffect(() => {
        const column = {
            field: 'actions',
            headerName: 'Aksiyonlar',
            type: 'actions',
            width: 150,
            getActions: (params) => [
                <ButtonPermission permission="TE_TEAM_VEHICLES_UPDATE" grid  icon={<EditIcon />} onClick={() => editTeamVehicles(params)} label="Edit"></ButtonPermission>,
                <ButtonPermission permission="TE_TEAM_VEHICLES_DELETE" grid 
                icon={<DeleteIcon />}
                onClick={() => deleteTeamVehicle(params)}
                label="Delete"
                ></ButtonPermission>
            ]
        }
        columns.unshift(column)
    }, [])

    useEffect(() => {
            getData()
    }, [page, sortModel, location])

    function editTeamVehicles(params) {
        const teamVehicleId = params.id
        history.push(`/telematics/teams/team-vehicles/edit/${teamVehicleId}`)
    }

    async function deleteTeamVehicle(params) {
        const teamVehicleId = params.id
        const result = await service.deleteTeamVehicles(teamVehicleId)
        if (result?.status === 200) {
            getData()
            NotificationManager.success("Takım aracı silindi")
        } else {
            NotificationManager.error("Takım aracı silinirken bir hata oluştu")
        }
    }

    async function getData() {
        setIsLoading(true)
        const { field, sort } = sortModel.length > 0 ? sortModel[0] : { field: "createdAt", sort: "desc" }
        const params = {
            size: 10,
            page: page,
            sort: `${field},${sort}`
        }
        const result = await teamVehiclesServices.getTeamVehicles(params)
        const data = result?.data?.data
const properties = result?.data?.properties
        setCount(properties.totalPages)
        setTeamVehicles(data)
        setIsLoading(false)
    }

    function paginationChange(_, e_page) {
        setPage(e_page - 1)
    }

    function goCreate() {
        history.push(`/telematics/teams/team-vehicles/create`)
    }

    function filter(by, searchText) {
        switch (by) {
            case "dataProtocol":
                console.log("----dataProtocol", searchText);
                break;
            case "dataProtocolVersion":
                console.log("----dataProtocolVersion", searchText);
                break
            default:
                break;
        }
    }

    return (
      <div className="team-vehicles-list">
        {isLoading ? (
          <CircularProgress className="team-vehicles-list-circular-progress" />
        ) : (
          <div className="team-vehicles-list-table-area">
            <div className="team-vehicles-list-table-area-header">
              <ButtonPermission
                permission="TE_TEAM_VEHICLES_CREATE"
                variant="outlined"
                startIcon={<Add />}
                size="small"
                onClick={goCreate}
              >
                Yeni Takım Aracı Ekle
              </ButtonPermission>
            </div>

            <DataGrid
              components={{ Toolbar: Header, NoRowsOverlay: CustomNoRowsOverlay, FilterPanel: CustomFilterPanel }}
              rows={teamVehicles}
              columns={columns}
              rowHeight={35}
              headerHeight={35}
              autoHeight
              hideFooter
              showColumnRightBorder
              sortingMode="server"
              className="team-vehicles-list-table-area-table"
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
            <div className="team-vehicles-list-table-area-pagination">
              <Pagination page={page + 1} onChange={paginationChange} count={count} color="primary" size="small" />
            </div>
          </div>
        )}
      </div>
    )
}

export default TeamVehicles
