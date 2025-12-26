import { useDrag } from 'react-dnd';
import { Bed, Armchair, Monitor, Refrigerator, Droplet, Activity, Square, DoorOpen, Heart, XCircle, Scan, Scissors, Users, Ambulance, Car, Type, Briefcase, UsersRound, Package, Coffee, CornerDownRight, Minus, AlertTriangle, ArrowUpDown, StickyNote } from 'lucide-react';

interface PaletteItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

interface ComponentPaletteProps {
  searchQuery?: string;
}

const paletteItems: PaletteItem[] = [
  // Rooms
  { type: 'trauma_room', label: 'Trauma Bay', icon: <Heart className="w-5 h-5" />, category: 'Rooms' },
  { type: 'exam_room', label: 'Exam Room', icon: <Activity className="w-5 h-5" />, category: 'Rooms' },
  { type: 'xray_room', label: 'X-Ray Room', icon: <XCircle className="w-5 h-5" />, category: 'Rooms' },
  { type: 'ct_room', label: 'CT Scan Room', icon: <Scan className="w-5 h-5" />, category: 'Rooms' },
  { type: 'operating_room', label: 'Operating Room', icon: <Scissors className="w-5 h-5" />, category: 'Rooms' },
  { type: 'waiting_room', label: 'Waiting Room', icon: <Users className="w-5 h-5" />, category: 'Rooms' },
  { type: 'office', label: 'Office', icon: <Briefcase className="w-5 h-5" />, category: 'Rooms' },
  { type: 'conference_room', label: 'Conference Room', icon: <UsersRound className="w-5 h-5" />, category: 'Rooms' },
  { type: 'ambulance_bay', label: 'Ambulance Bay', icon: <Ambulance className="w-5 h-5" />, category: 'Rooms' },
  { type: 'parking_lot', label: 'Parking Lot', icon: <Car className="w-5 h-5" />, category: 'Rooms' },
  { type: 'utility_room', label: 'Utility Room', icon: <Package className="w-5 h-5" />, category: 'Rooms' },
  { type: 'staff_lounge', label: 'Staff Lounge', icon: <Coffee className="w-5 h-5" />, category: 'Rooms' },
  
  // Structure
  { type: 'wall_h', label: 'Wall (Horizontal)', icon: <Square className="w-5 h-5" />, category: 'Structure' },
  { type: 'wall_v', label: 'Wall (Vertical)', icon: <Square className="w-5 h-5" />, category: 'Structure' },
  { type: 'corner_wall', label: 'Corner Wall', icon: <CornerDownRight className="w-5 h-5" />, category: 'Structure' },
  { type: 'door', label: 'Door', icon: <DoorOpen className="w-5 h-5" />, category: 'Structure' },
  { type: 'fire_exit', label: 'Fire Exit', icon: <AlertTriangle className="w-5 h-5" />, category: 'Structure' },
  { type: 'curtain', label: 'Curtain', icon: <Minus className="w-5 h-5" />, category: 'Structure' },
  { type: 'elevator', label: 'Elevator', icon: <ArrowUpDown className="w-5 h-5" />, category: 'Structure' },
  { type: 'stairwell', label: 'Stairwell', icon: <ArrowUpDown className="w-5 h-5" />, category: 'Structure' },
  
  // Furniture
  { type: 'bed', label: 'Hospital Bed', icon: <Bed className="w-5 h-5" />, category: 'Furniture' },
  { type: 'gurney', label: 'Gurney', icon: <Bed className="w-5 h-5" />, category: 'Furniture' },
  { type: 'chair', label: 'Chair', icon: <Armchair className="w-5 h-5" />, category: 'Furniture' },
  { type: 'desk', label: 'Desk', icon: <Square className="w-5 h-5" />, category: 'Furniture' },
  { type: 'nurses_station', label: 'Staff Station', icon: <UsersRound className="w-5 h-5" />, category: 'Furniture' },
  { type: 'cabinet', label: 'Cabinet', icon: <Refrigerator className="w-5 h-5" />, category: 'Furniture' },
  { type: 'sink', label: 'Sink', icon: <Droplet className="w-5 h-5" />, category: 'Furniture' },
  
  // Equipment
  { type: 'computer', label: 'Computer', icon: <Monitor className="w-5 h-5" />, category: 'Equipment' },
  { type: 'pyxis', label: 'Pyxis', icon: <Package className="w-5 h-5" />, category: 'Equipment' },
  
  // Symbols
  { type: 'blank_box', label: 'Blank Box', icon: <Square className="w-5 h-5" />, category: 'Symbols' },
  { type: 'text_box', label: 'Text Box', icon: <Type className="w-5 h-5" />, category: 'Symbols' },
  { type: 'annotation', label: 'Annotation', icon: <StickyNote className="w-5 h-5" />, category: 'Symbols' },
];

function DraggableItem({ item }: { item: PaletteItem }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: () => ({ type: item.type }),
    end: (item, monitor) => {
      // Reset any drag state when the drag ends
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [item.type]);

  return (
    <div
      ref={drag}
      className={`p-3 bg-secondary rounded-lg cursor-move hover:bg-secondary/80 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-primary">{item.icon}</div>
        <span className="text-foreground text-sm">{item.label}</span>
      </div>
    </div>
  );
}

export function ComponentPalette({ searchQuery = '' }: ComponentPaletteProps) {
  // Filter items based on search query
  const filteredItems = paletteItems.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define category order
  const categoryOrder = ['Rooms', 'Structure', 'Furniture', 'Equipment', 'Symbols'];
  const categories = categoryOrder.filter(cat => 
    filteredItems.some(item => item.category === cat)
  );

  return (
    <div className="overflow-y-auto">
      <div className="p-4">
        {!searchQuery && <h2 className="text-foreground mb-4">Components</h2>}
        
        {searchQuery && filteredItems.length === 0 && (
          <div className="text-muted-foreground text-sm text-center py-8">
            No components found
          </div>
        )}
        
        {categories.map(category => (
          <div key={category} className="mb-6">
            <h3 className="text-muted-foreground text-sm mb-2">{category}</h3>
            <div className="space-y-2">
              {filteredItems
                .filter(item => item.category === category)
                .map(item => (
                  <DraggableItem key={item.type} item={item} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}