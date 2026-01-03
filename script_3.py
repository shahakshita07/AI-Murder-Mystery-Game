# 4. Wumpus-Style Inference System for Hazard Detection

class WumpusInference:
    def __init__(self, mansion):
        self.mansion = mansion
        self.knowledge_base = set()  # Propositional logic statements
        self.safe_rooms = set()
        self.dangerous_rooms = set()
        self.current_room = 'Hall'  # Start in the Hall
        
    def add_knowledge(self, statement):
        """Add a knowledge statement to the KB"""
        self.knowledge_base.add(statement)
        
    def infer_safe_rooms(self):
        """Use logical inference to determine safe rooms"""
        # If we've been in a room and survived, it's safe
        for statement in self.knowledge_base:
            if statement.startswith("visited_") and "survived" in statement:
                room = statement.split("visited_")[1].split("_")[0]
                self.safe_rooms.add(room)
        
        # If no hazard warnings detected from a room, adjacent rooms might be safe
        for room in self.mansion.rooms:
            warnings = self.mansion.check_hazard_warnings(room)
            if not warnings and room in self.safe_rooms:
                # If we're in a safe room with no warnings, 
                # we can infer some adjacent rooms are safe
                for adjacent in self.mansion.rooms[room]:
                    if adjacent not in self.mansion.hazards:
                        self.safe_rooms.add(adjacent)
    
    def detect_hazards(self, current_room):
        """Detect hazards using sensor information"""
        warnings = self.mansion.check_hazard_warnings(current_room)
        
        if warnings:
            print(f"HAZARD DETECTION in {current_room}:")
            for warning in warnings:
                print(f"  ⚠️  {warning}")
                
                # Add logical statements to knowledge base
                if "gas" in warning.lower():
                    self.add_knowledge(f"gas_detected_from_{current_room}")
                    self.dangerous_rooms.add('Cellar')
                    
                if "rumbling" in warning.lower():
                    self.add_knowledge(f"rumbling_detected_from_{current_room}")
                    self.dangerous_rooms.add('Secret Passage')
        
        # Record that we visited this room and survived
        self.add_knowledge(f"visited_{current_room}_survived")
        
        return warnings
    
    def can_safely_enter(self, room):
        """Determine if it's safe to enter a room"""
        if room in self.safe_rooms:
            return True
        if room in self.dangerous_rooms:
            return False
        
        # Use logical inference
        if room == 'Cellar':
            # Only safe if we have gas mask or know gas is cleared
            return "gas_mask_equipped" in self.knowledge_base
        
        if room == 'Secret Passage':
            # Only safe if structure is reinforced or collapse risk is low
            return "structure_reinforced" in self.knowledge_base
            
        return True  # Assume safe if no evidence of danger
    
    def plan_safe_route(self, destination):
        """Plan a route avoiding known hazards"""
        if not self.can_safely_enter(destination):
            return None, f"Destination {destination} is too dangerous!"
            
        # Use BFS but avoid dangerous rooms
        queue = deque([(self.current_room, [self.current_room])])
        visited = set([self.current_room])
        
        while queue:
            current, path = queue.popleft()
            
            if current == destination:
                return path, "Safe route found"
            
            for neighbor in self.mansion.rooms[current]:
                if neighbor not in visited:
                    if self.can_safely_enter(neighbor):
                        new_path = path + [neighbor]
                        visited.add(neighbor)
                        queue.append((neighbor, new_path))
                    else:
                        print(f"Avoiding dangerous room: {neighbor}")
        
        return None, "No safe route found"
    
    def move_to_room(self, room):
        """Move to a room with hazard checking"""
        print(f"\n--- Moving from {self.current_room} to {room} ---")
        
        # Check if the move is valid
        if room not in self.mansion.rooms[self.current_room]:
            return False, f"Cannot move directly from {self.current_room} to {room}"
        
        # Check for hazards before moving
        if not self.can_safely_enter(room):
            return False, f"Too dangerous to enter {room}!"
        
        # Move to the room
        self.current_room = room
        
        # Detect hazards and update knowledge
        warnings = self.detect_hazards(room)
        
        # Check for clues
        if room in self.mansion.clues:
            print(f"🔍 CLUE FOUND: {self.mansion.clues[room]}")
        
        # Update inference
        self.infer_safe_rooms()
        
        return True, f"Successfully moved to {room}"

# Test the Wumpus inference system
print("\n=== WUMPUS-STYLE INFERENCE SYSTEM ===")

mansion = MansionGraph()  # Reuse our mansion from before
wumpus = WumpusInference(mansion)

print(f"Starting location: {wumpus.current_room}")
print("Knowledge base (initially empty):", len(wumpus.knowledge_base))

# Simulate exploration with hazard detection
exploration_sequence = [
    ('Study', 'Moving to Study to look for clues'),
    ('Library', 'Investigating the Library'),
    ('Study', 'Returning to Study'), 
    ('Hall', 'Back to Hall'),
    ('Conservatory', 'Checking the Conservatory'),
    ('Hall', 'Back to Hall after hearing rumbling'),
    ('Dining Room', 'Investigating the crime scene'),
    ('Kitchen', 'Moving to Kitchen - should detect gas warning')
]

print(f"\n=== EXPLORATION WITH HAZARD DETECTION ===")
for destination, description in exploration_sequence:
    print(f"\n{description}")
    success, message = wumpus.move_to_room(destination)
    print(f"Result: {message}")
    
    if not success:
        print("❌ Movement failed!")
        break

print(f"\n=== FINAL KNOWLEDGE STATE ===")
print(f"Knowledge base contains {len(wumpus.knowledge_base)} statements:")
for statement in sorted(wumpus.knowledge_base):
    print(f"  • {statement}")

print(f"\nSafe rooms identified: {sorted(wumpus.safe_rooms)}")
print(f"Dangerous rooms identified: {sorted(wumpus.dangerous_rooms)}")

# Test safe route planning
print(f"\n=== SAFE ROUTE PLANNING ===")
test_destinations = ['Library', 'Cellar', 'Secret Passage']

for dest in test_destinations:
    route, message = wumpus.plan_safe_route(dest)
    print(f"\nRoute to {dest}: {message}")
    if route:
        print(f"  Path: {' -> '.join(route)}")
    else:
        print(f"  No safe path available")