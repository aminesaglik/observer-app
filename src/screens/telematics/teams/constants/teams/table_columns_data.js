export const columns = [
  { field: 'id', headerName: 'Takım Adı', width: 150, notFilter: true },
  { field: 'description', headerName: 'Açıklama', width: 150 },
  { field: 'status', headerName: 'Durum', width: 150 },
  {
    field: 'createdAt',
    headerName: 'Oluşturulma Tarihi',
    width: 150,
    renderCell: (e) => <div>{new Date(e.value).toLocaleString('tr')}</div>
  },
  {
    field: 'updatedAt',
    headerName: 'Güncellenme Tarihi',
    width: 150,
    renderCell: (e) => <div>{new Date(e.value).toLocaleString('tr')}</div>
  }
]
