# Let's implement the core algorithms for the murder mystery game

# 1. BFS for pathfinding in the mansion
from collections import deque
import random

class MansionGraph:
    """Represents the mansion as a graph for pathfinding"""
    
    def __init__(self):
        # Define the mansion layout from the user's description
        self.rooms = {
            'Hall': ['Study', 'Dining Room', 'Conservatory'],
            'Study': ['Hall', 'Library'],
            'Library': ['Study'],  # Dead end with clue
            'Dining Room': ['Hall', 'Kitchen'], 
            'Kitchen': ['Dining Room', 'Cellar'],
            'Cellar': ['Kitchen'],  # Hazard: gas leak
            'Conservatory': ['Hall', 'Secret Passage'],
            'Secret Passage': ['Conservatory']  # Hazard: may collapse
        }
        
        # Define clues in each room
        self.clues = {
            'Library': 'Bloodstained glove (belongs to Heiress)',
            'Dining Room': 'Shattered wine glass (Butler broke it)',
            'Study': 'Suspicious ledger with payments to Chef',
            'Kitchen': 'Missing knife (red herring)'
        }
        
        # Define hazards (Wumpus-style)
        self.hazards = {
            'Cellar': 'Gas leak - entering without caution = game over',
            'Secret Passage': 'May collapse - you hear rumbling nearby'
        }
        
        # Hazard warnings in adjacent rooms
        self.warnings = {
            'Kitchen': ['You smell gas from the Cellar'],
            'Conservatory': ['You hear rumbling from the Secret Passage']
        }

    def bfs_pathfind(self, start, goal):
        """Find shortest path using BFS"""
        if start == goal:
            return [start]
        
        queue = deque([(start, [start])])
        visited = set([start])
        
        while queue:
            current, path = queue.popleft()
            
            for neighbor in self.rooms[current]:
                if neighbor not in visited:
                    new_path = path + [neighbor]
                    if neighbor == goal:
                        return new_path
                    
                    visited.add(neighbor)
                    queue.append((neighbor, new_path))
        
        return None  # No path found

    def get_safe_rooms(self):
        """Get rooms that are safe to enter"""
        safe_rooms = []
        for room in self.rooms:
            if room not in self.hazards:
                safe_rooms.append(room)
        return safe_rooms

    def check_hazard_warnings(self, current_room):
        """Wumpus-style inference: check for hazard warnings"""
        warnings = []
        if current_room in self.warnings:
            warnings.extend(self.warnings[current_room])
        return warnings

# Test the pathfinding
mansion = MansionGraph()

print("=== MANSION PATHFINDING SYSTEM ===")
print(f"Mansion layout: {mansion.rooms}")
print("\n=== BFS Pathfinding Examples ===")

# Find path from Hall to Library  
path1 = mansion.bfs_pathfind('Hall', 'Library')
print(f"Path from Hall to Library: {' -> '.join(path1) if path1 else 'No path found'}")

# Find path from Hall to Cellar (hazardous)
path2 = mansion.bfs_pathfind('Hall', 'Cellar') 
print(f"Path from Hall to Cellar: {' -> '.join(path2) if path2 else 'No path found'}")

print(f"\n=== Room Information ===")
for room, connections in mansion.rooms.items():
    info = f"{room}: connected to {connections}"
    if room in mansion.clues:
        info += f" | CLUE: {mansion.clues[room]}"
    if room in mansion.hazards:
        info += f" | HAZARD: {mansion.hazards[room]}"
    print(info)