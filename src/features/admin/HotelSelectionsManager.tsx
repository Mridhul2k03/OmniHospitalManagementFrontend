import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { useAuth } from '@/auth/useAuth'
import { useTenant } from '@/context/useTenant'
import { roomsApi } from '@/api/endpoints/rooms.api'
import { propertiesApi } from '@/api/endpoints/properties.api'
import { RoomType, Floor, Building } from '@/types'
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Building2,
  Sparkles,
  RefreshCw,
  Sliders,
  DollarSign,
  Users,
  Shield,
  Search,
} from 'lucide-react'

export interface HotelSelectionsManagerProps {
  initialSubTab?: 'types' | 'floors' | 'amenities' | 'buildings'
  onDataChanged?: () => void
}

export const HotelSelectionsManager: React.FC<HotelSelectionsManagerProps> = ({
  initialSubTab = 'types',
  onDataChanged,
}) => {
  const { activeProperty } = useTenant()
  const { hasRole, hasPermission } = useAuth()
  const { success, error: toastError } = useToast()

  const [activeTab, setActiveTab] = useState<'types' | 'floors' | 'amenities' | 'buildings'>(initialSubTab)
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [amenities, setAmenities] = useState<{ id: string; name: string; icon?: string; description?: string }[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState('')

  // Modals state
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<RoomType | null>(null)
  const [typeName, setTypeName] = useState('')
  const [typeCode, setTypeCode] = useState('')
  const [typeRate, setTypeRate] = useState(250)
  const [typeOccupancy, setTypeOccupancy] = useState(2)
  const [typeDescription, setTypeDescription] = useState('')

  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false)
  const [floorNumber, setFloorNumber] = useState<number>(1)
  const [floorName, setFloorName] = useState('')

  const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false)
  const [amenityName, setAmenityName] = useState('')
  const [amenityDesc, setAmenityDesc] = useState('')

  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false)
  const [buildingName, setBuildingName] = useState('')
  const [buildingCode, setBuildingCode] = useState('')

  // Permission Guard
  const canManage =
    hasRole(['super_admin', 'org_admin', 'property_manager', 'operations_director', 'ceo']) ||
    hasPermission('property:manage') ||
    hasPermission('room:create') ||
    hasPermission('*')

  const loadAllSelections = async () => {
    setIsLoading(true)
    try {
      const [typesRes, floorsRes, amenitiesRes, buildingsRes] = await Promise.all([
        roomsApi.getRoomTypes().catch(() => []),
        propertiesApi.getFloors().catch(() => []),
        roomsApi.getAmenities().catch(() => []),
        propertiesApi.getBuildings(activeProperty.id).catch(() => []),
      ])
      setRoomTypes(typesRes)
      setFloors(floorsRes)
      setAmenities(amenitiesRes)
      setBuildings(buildingsRes)
    } catch (err) {
      console.warn('Error loading hotel selections:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllSelections()
  }, [activeProperty.id])

  // --- ROOM TYPE ACTIONS ---
  const handleOpenCreateType = () => {
    setEditingType(null)
    setTypeName('')
    setTypeCode('')
    setTypeRate(250)
    setTypeOccupancy(2)
    setTypeDescription('')
    setIsTypeModalOpen(true)
  }

  const handleOpenEditType = (rt: RoomType) => {
    setEditingType(rt)
    setTypeName(rt.name)
    setTypeCode(rt.code)
    setTypeRate(rt.basePrice || 250)
    setTypeOccupancy(rt.maxOccupancy || 2)
    setTypeDescription(rt.description || '')
    setIsTypeModalOpen(true)
  }

  const handleSaveRoomType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typeName.trim()) return

    try {
      if (editingType) {
        await roomsApi.updateRoomType(editingType.id, {
          name: typeName.trim(),
          code: typeCode.trim() || undefined,
          basePrice: Number(typeRate),
          maxOccupancy: Number(typeOccupancy),
          description: typeDescription,
        })
        success('Room Type Updated', `Updated ${typeName.trim()} successfully.`)
      } else {
        await roomsApi.createRoomType({
          name: typeName.trim(),
          code: typeCode.trim() || undefined,
          basePrice: Number(typeRate),
          maxOccupancy: Number(typeOccupancy),
          description: typeDescription,
          propertyId: activeProperty.id,
        })
        success('Room Type Created', `Added ${typeName.trim()} to hotel catalog.`)
      }
      setIsTypeModalOpen(false)
      loadAllSelections()
      onDataChanged?.()
    } catch (err: any) {
      toastError('Save Failed', err?.response?.data?.detail || 'Could not save room type.')
    }
  }

  const handleDeleteRoomType = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove the room category "${name}"?`)) return
    try {
      await roomsApi.deleteRoomType(id)
      success('Room Type Removed', `Removed ${name} from catalog.`)
      setRoomTypes((prev) => prev.filter((t) => t.id !== id))
      onDataChanged?.()
    } catch (err: any) {
      toastError('Delete Failed', 'Could not delete room type.')
    }
  }

  // --- FLOOR ACTIONS ---
  const handleOpenCreateFloor = () => {
    setFloorNumber(floors.length + 1)
    setFloorName(`Floor ${floors.length + 1}`)
    setIsFloorModalOpen(true)
  }

  const handleSaveFloor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!floorName.trim()) return

    try {
      await propertiesApi.createFloor({
        floor_number: Number(floorNumber),
        name: floorName.trim(),
      })
      success('Floor Added', `Added ${floorName.trim()} to physical inventory.`)
      setIsFloorModalOpen(false)
      loadAllSelections()
      onDataChanged?.()
    } catch (err: any) {
      toastError('Save Failed', 'Could not save floor.')
    }
  }

  const handleDeleteFloor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return
    try {
      await propertiesApi.deleteFloor(id)
      success('Floor Removed', `Deleted ${name}.`)
      setFloors((prev) => prev.filter((f) => f.id !== id))
      onDataChanged?.()
    } catch (err) {
      toastError('Delete Failed', 'Could not delete floor.')
    }
  }

  // --- AMENITY ACTIONS ---
  const handleSaveAmenity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amenityName.trim()) return
    try {
      await roomsApi.createAmenity({
        name: amenityName.trim(),
        description: amenityDesc.trim(),
      })
      success('Amenity Added', `Added ${amenityName.trim()} to amenity catalog.`)
      setIsAmenityModalOpen(false)
      setAmenityName('')
      setAmenityDesc('')
      loadAllSelections()
      onDataChanged?.()
    } catch (err) {
      toastError('Save Failed', 'Could not save amenity.')
    }
  }

  const handleDeleteAmenity = async (id: string, name: string) => {
    if (!confirm(`Delete amenity "${name}"?`)) return
    try {
      await roomsApi.deleteAmenity(id)
      success('Amenity Removed', `Removed ${name}.`)
      setAmenities((prev) => prev.filter((a) => a.id !== id))
      onDataChanged?.()
    } catch (err) {
      toastError('Delete Failed', 'Could not delete amenity.')
    }
  }

  // --- BUILDING ACTIONS ---
  const handleSaveBuilding = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!buildingName.trim()) return
    try {
      await propertiesApi.createBuilding({
        name: buildingName.trim(),
        code: buildingCode.trim() || undefined,
        property: activeProperty.id,
      })
      success('Building Wing Added', `Added ${buildingName.trim()} to property.`)
      setIsBuildingModalOpen(false)
      setBuildingName('')
      setBuildingCode('')
      loadAllSelections()
      onDataChanged?.()
    } catch (err) {
      toastError('Save Failed', 'Could not save building.')
    }
  }

  const handleDeleteBuilding = async (id: string, name: string) => {
    if (!confirm(`Delete building "${name}"?`)) return
    try {
      await propertiesApi.deleteBuilding(id)
      success('Building Removed', `Removed ${name}.`)
      setBuildings((prev) => prev.filter((b) => b.id !== id))
      onDataChanged?.()
    } catch (err) {
      toastError('Delete Failed', 'Could not delete building.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            Hotel Options & Master Selections
          </h2>
          <p className="text-xs text-muted-foreground">
            Authoritative physical architecture, categories, and inventory parameters for {activeProperty.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadAllSelections} disabled={isLoading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {canManage && (
            <>
              {activeTab === 'types' && (
                <Button size="sm" onClick={handleOpenCreateType} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Room Type
                </Button>
              )}
              {activeTab === 'floors' && (
                <Button size="sm" onClick={handleOpenCreateFloor} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Floor Level
                </Button>
              )}
              {activeTab === 'amenities' && (
                <Button size="sm" onClick={() => setIsAmenityModalOpen(true)} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Amenity
                </Button>
              )}
              {activeTab === 'buildings' && (
                <Button size="sm" onClick={() => setIsBuildingModalOpen(true)} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Building Wing
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sub-tabs selector pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('types')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'types'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Room Categories ({roomTypes.length})
        </button>

        <button
          onClick={() => setActiveTab('floors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'floors'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Floors & Levels ({floors.length})
        </button>

        <button
          onClick={() => setActiveTab('amenities')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'amenities'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Room Amenities ({amenities.length})
        </button>

        <button
          onClick={() => setActiveTab('buildings')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'buildings'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          Buildings & Wings ({buildings.length})
        </button>
      </div>

      {/* --- TAB 1: ROOM CATEGORIES --- */}
      {activeTab === 'types' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Category / Type Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Standard Daily Rate</TableHead>
                <TableHead>Max Occupancy</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs">
                    No custom room types defined yet. Click "Add Room Type" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                roomTypes.map((rt) => (
                  <TableRow key={rt.id}>
                    <TableCell className="font-bold text-xs text-foreground">{rt.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{rt.code}</TableCell>
                    <TableCell className="font-semibold text-xs text-emerald-600 dark:text-emerald-400">
                      ${rt.basePrice} / night
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{rt.maxOccupancy} Guests</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                      {rt.description || 'Standard luxury room accommodations'}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {canManage && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleOpenEditType(rt)}>
                            <Edit3 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteRoomType(rt.id, rt.name)}>
                            <Trash2 className="h-3.5 w-3.5 text-rose-500 hover:text-rose-600" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --- TAB 2: FLOORS --- */}
      {activeTab === 'floors' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Floor #</TableHead>
                <TableHead>Display Title / Name</TableHead>
                <TableHead>Building</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {floors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground text-xs">
                    No physical floors recorded yet. Click "Add Floor Level" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                floors.map((fl) => (
                  <TableRow key={fl.id}>
                    <TableCell className="font-mono font-bold text-xs text-primary">Floor {fl.floorNumber}</TableCell>
                    <TableCell className="font-semibold text-xs text-foreground">{fl.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{fl.buildingName || 'Main Tower'}</TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteFloor(fl.id, fl.name)}>
                          <Trash2 className="h-3.5 w-3.5 text-rose-500 hover:text-rose-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --- TAB 3: AMENITIES --- */}
      {activeTab === 'amenities' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {amenities.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground text-xs border border-dashed rounded-xl">
              No amenities registered. Click "Add Amenity" to catalog one.
            </div>
          ) : (
            amenities.map((am) => (
              <div key={am.id} className="rounded-xl border border-border bg-card p-3 flex items-start justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    {am.name}
                  </span>
                  {am.description && <p className="text-[11px] text-muted-foreground mt-0.5">{am.description}</p>}
                </div>
                {canManage && (
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleDeleteAmenity(am.id, am.name)}>
                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* --- TAB 4: BUILDINGS --- */}
      {activeTab === 'buildings' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Building / Wing Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buildings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                    No separate buildings configured. The main property structure is active.
                  </TableCell>
                </TableRow>
              ) : (
                buildings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-bold text-xs text-foreground">{b.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{b.code}</TableCell>
                    <TableCell className="text-right">
                      {canManage && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleDeleteBuilding(b.id, b.name)}>
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT ROOM TYPE --- */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title={editingType ? `Edit Room Category: ${editingType.name}` : 'Create New Room Category / Type'}
        description={`Configure standard pricing, codes, and occupancy locks for ${activeProperty.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveRoomType} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Oceanfront Executive King, Garden Villa"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">Code / Slug (Optional)</label>
              <input
                type="text"
                placeholder="e.g. OF-EXEC-KING"
                value={typeCode}
                onChange={(e) => setTypeCode(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Base Daily Rate ($ USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={typeRate}
                onChange={(e) => setTypeRate(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Max Occupancy (Guests)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={typeOccupancy}
              onChange={(e) => setTypeOccupancy(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Brief description of features and amenities included in this tier..."
              value={typeDescription}
              onChange={(e) => setTypeDescription(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsTypeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              {editingType ? 'Save Changes' : 'Create Room Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL: CREATE FLOOR --- */}
      <Modal
        isOpen={isFloorModalOpen}
        onClose={() => setIsFloorModalOpen(false)}
        title="Add Floor Level"
        description="Expand physical floor capacity for the hotel property"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveFloor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Floor Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={floorNumber}
              onChange={(e) => {
                const n = Number(e.target.value)
                setFloorNumber(n)
                if (!floorName || floorName.startsWith('Floor ')) {
                  setFloorName(`Floor ${n}`)
                }
              }}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Floor Title / Label <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Floor 6 (Skyline Suites)"
              value={floorName}
              onChange={(e) => setFloorName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsFloorModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Add Floor
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL: CREATE AMENITY --- */}
      <Modal
        isOpen={isAmenityModalOpen}
        onClose={() => setIsAmenityModalOpen(false)}
        title="Add Room Amenity"
        description="Register an amenity option for room types"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveAmenity} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Amenity Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Heated Jacuzzi, Espresso Bar, Ocean Balcony"
              value={amenityName}
              onChange={(e) => setAmenityName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Description</label>
            <input
              type="text"
              placeholder="Optional description"
              value={amenityDesc}
              onChange={(e) => setAmenityDesc(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsAmenityModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Add Amenity
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- MODAL: CREATE BUILDING --- */}
      <Modal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
        title="Add Building Wing"
        description="Register a building structure on property grounds"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveBuilding} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Building Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ocean Wing, Sunrise Villas"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">Building Code</label>
            <input
              type="text"
              placeholder="e.g. BLD-OCEAN"
              value={buildingCode}
              onChange={(e) => setBuildingCode(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsBuildingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              Add Building
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
