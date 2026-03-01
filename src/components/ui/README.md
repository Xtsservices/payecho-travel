# MOTELTRIPS.COM UI Components Library

A comprehensive collection of reusable UI components built with React, TypeScript, Tailwind CSS, and Motion (Framer Motion).

## Installation

Import components from the UI library:

```tsx
import { Button, Input, Modal, Badge } from './components/ui';
```

## Components

### Button
Primary button component with multiple variants and sizes.

```tsx
<Button 
  variant="primary" 
  size="md" 
  icon={Plus}
  onClick={() => console.log('clicked')}
>
  Create User
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `icon`: LucideIcon component
- `iconPosition`: 'left' | 'right'
- `fullWidth`: boolean
- `disabled`: boolean

---

### IconButton
Compact icon-only button for actions.

```tsx
<IconButton 
  icon={Eye} 
  variant="primary" 
  onClick={() => handleView()}
/>
```

**Props:**
- `icon`: LucideIcon (required)
- `variant`: 'primary' | 'success' | 'danger' | 'warning' | 'secondary'
- `size`: 'sm' | 'md' | 'lg'
- `ariaLabel`: string for accessibility

---

### Input
Text input field with label, icon, and error support.

```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  icon={Mail}
  required
  error="Invalid email"
/>
```

**Props:**
- `type`: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
- `label`: string
- `icon`: LucideIcon
- `error`: string
- `required`: boolean
- `disabled`: boolean

---

### Select
Dropdown select component with options.

```tsx
<Select
  label="Role"
  options={[
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' }
  ]}
  placeholder="Select a role"
  icon={Shield}
/>
```

**Props:**
- `options`: Array<{ value: string, label: string }>
- `label`: string
- `placeholder`: string
- `icon`: LucideIcon
- `required`: boolean

---

### TextArea
Multi-line text input.

```tsx
<TextArea
  label="Description"
  rows={4}
  placeholder="Enter description"
/>
```

**Props:**
- `label`: string
- `rows`: number
- `placeholder`: string
- `error`: string
- `required`: boolean

---

### Badge
Status and label badge component.

```tsx
<Badge variant="success" size="md">
  Active
</Badge>
```

**Props:**
- `variant`: 'primary' | 'success' | 'danger' | 'warning' | 'secondary' | 'purple' | 'orange'
- `size`: 'sm' | 'md' | 'lg'

---

### Modal
Full-featured modal dialog with animations.

```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Create User"
  size="md"
>
  <div>Modal content here</div>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: function
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean

---

### Card
Container card with optional padding and hover effects.

```tsx
<Card padding="lg" hover>
  <h3>Card Content</h3>
</Card>
```

**Props:**
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `hover`: boolean
- `onClick`: function

---

### Table, TableRow, TableCell
Table components with animations.

```tsx
<Table
  columns={[
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' }
  ]}
>
  <TableRow delay={0}>
    <TableCell>John Doe</TableCell>
    <TableCell>john@example.com</TableCell>
  </TableRow>
</Table>
```

---

### StatCard
Statistics display card with icon and change indicator.

```tsx
<StatCard
  label="Total Users"
  value="1,234"
  change="+12%"
  icon={Users}
  color="from-cyan-500 to-blue-600"
  delay={0.1}
/>
```

**Props:**
- `label`: string
- `value`: string
- `change`: string (optional)
- `icon`: LucideIcon
- `color`: Tailwind gradient class
- `delay`: number (animation delay)

---

### Tab
Tabbed navigation component.

```tsx
<Tab
  tabs={[
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: 'Users', icon: Users }
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>
```

**Props:**
- `tabs`: Array<{ id: string, label: string, icon: LucideIcon }>
- `activeTab`: string
- `onTabChange`: function

---

### RadioGroup
Radio button group component.

```tsx
<RadioGroup
  label="Status"
  name="status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ]}
  value={status}
  onChange={setStatus}
/>
```

---

### Avatar
User avatar with initials or image.

```tsx
<Avatar name="John Doe" size="md" />
<Avatar name="Jane Smith" image="/photo.jpg" size="lg" />
```

**Props:**
- `name`: string
- `image`: string (optional)
- `size`: 'sm' | 'md' | 'lg' | 'xl'

---

### FileUpload
Drag-and-drop file upload component.

```tsx
<FileUpload
  label="Upload Documents"
  accept=".pdf,.doc,.docx"
  multiple
  maxSize={10}
  onChange={(files) => console.log(files)}
/>
```

**Props:**
- `label`: string
- `accept`: string (file types)
- `multiple`: boolean
- `maxSize`: number (in MB)
- `onChange`: function

---

### Switch
Toggle switch component.

```tsx
<Switch
  checked={isEnabled}
  onChange={setIsEnabled}
  label="Enable notifications"
/>
```

**Props:**
- `checked`: boolean
- `onChange`: function
- `label`: string
- `disabled`: boolean

---

### Spinner
Loading spinner component.

```tsx
<Spinner size="md" color="border-cyan-500" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg'
- `color`: Tailwind border color class

---

### Alert
Alert/notification component with different types.

```tsx
<Alert
  type="success"
  title="Success!"
  message="User created successfully"
  onClose={() => setShowAlert(false)}
/>
```

**Props:**
- `type`: 'success' | 'error' | 'warning' | 'info'
- `title`: string
- `message`: string
- `onClose`: function
- `isOpen`: boolean

---

### Tooltip
Hover tooltip component.

```tsx
<Tooltip content="Click to view details" position="top">
  <button>Hover me</button>
</Tooltip>
```

**Props:**
- `content`: string
- `position`: 'top' | 'bottom' | 'left' | 'right'

---

### Pagination
Pagination component for tables and lists.

```tsx
<Pagination
  currentPage={currentPage}
  totalPages={10}
  onPageChange={setCurrentPage}
/>
```

**Props:**
- `currentPage`: number
- `totalPages`: number
- `onPageChange`: function

---

## Design System

### Colors
- **Primary**: Cyan to Blue gradient (`from-cyan-500 to-blue-600`)
- **Success**: Green (`bg-green-500`)
- **Danger**: Red (`bg-red-500`)
- **Warning**: Orange (`bg-orange-500`)
- **Secondary**: Gray (`bg-gray-100`)

### Animations
All interactive components use Motion for smooth animations:
- **Hover**: `scale: 1.02` to `1.05`
- **Tap**: `scale: 0.95` to `0.98`
- **Entry**: Fade + slide animations
- **Exit**: Reverse entry animations

### Typography
- **Font Weight**: Regular (400), Semibold (600), Bold (700), Black (900)
- **Rounded Corners**: `rounded-xl` (12px) for most components
- **Spacing**: Consistent padding and gaps using Tailwind's spacing scale

## Usage Examples

### Create User Form
```tsx
import { Modal, Input, Select, Button, RadioGroup } from './components/ui';

function CreateUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create User">
      <Input label="Full Name" placeholder="John Doe" required />
      <Input label="Email" type="email" icon={Mail} required />
      <Select
        label="Role"
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' }
        ]}
      />
      <RadioGroup
        label="Status"
        name="status"
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]}
      />
      <Button variant="primary" fullWidth>
        Create User
      </Button>
    </Modal>
  );
}
```

### Dashboard Stats
```tsx
import { StatCard } from './components/ui';

function DashboardStats() {
  const stats = [
    { label: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'from-cyan-500 to-blue-600' },
    { label: 'Revenue', value: '$45K', change: '+25%', icon: DollarSign, color: 'from-green-500 to-emerald-600' }
  ];
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <StatCard key={i} {...stat} delay={i * 0.1} />
      ))}
    </div>
  );
}
```

## Best Practices

1. **Consistency**: Use these components throughout the application for a cohesive design
2. **Accessibility**: Components include ARIA labels and keyboard navigation
3. **Responsiveness**: All components are mobile-friendly
4. **Performance**: Components use Motion for optimized animations
5. **Type Safety**: Full TypeScript support with proper prop types

## License

Part of MOTELTRIPS.COM - All rights reserved
