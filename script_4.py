# Save all the algorithm implementations and game data to CSV files

import csv
import json

# 1. Save mansion layout and pathfinding data
mansion_data = []
for room, connections in mansion.rooms.items():
    clue = mansion.clues.get(room, "")
    hazard = mansion.hazards.get(room, "")
    warnings = ", ".join(mansion.warnings.get(room, []))
    
    mansion_data.append({
        'room': room,
        'connections': ", ".join(connections),
        'clue': clue,
        'hazard': hazard, 
        'warnings': warnings
    })

with open('mansion_layout.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['room', 'connections', 'clue', 'hazard', 'warnings'])
    writer.writeheader()
    writer.writerows(mansion_data)

# 2. Save suspect profiles and dialogue data
suspect_data = []
for role, info in dialogue_system.suspects.items():
    suspect_data.append({
        'role': role,
        'name': info['name'],
        'personality': info['personality'],
        'is_guilty': info['guilty'],
        'truth_level': info['truth_value'],
        'suspicion_level': info['suspicion_level']
    })

with open('suspect_profiles.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['role', 'name', 'personality', 'is_guilty', 'truth_level', 'suspicion_level'])
    writer.writeheader()
    writer.writerows(suspect_data)

# 3. Save clue analysis and CSP results
csp_results = []
for clue_name, description in clues_found:
    csp_results.append({
        'clue_name': clue_name,
        'description': description,
        'affects_murderer': 'Heiress' in description or 'ledger' in clue_name or 'glove' in clue_name,
        'constraint_weight': next((c['weight'] for c in mystery_csp.constraints 
                                 if clue_name.replace('_', ' ') in str(c)), 0)
    })

with open('clue_analysis.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['clue_name', 'description', 'affects_murderer', 'constraint_weight'])
    writer.writeheader() 
    writer.writerows(csp_results)

# 4. Save algorithm performance data
algorithm_performance = [
    {
        'algorithm': 'BFS Pathfinding',
        'purpose': 'Room navigation and shortest path finding',
        'time_complexity': 'O(V + E) where V=vertices, E=edges',
        'space_complexity': 'O(V)',
        'implemented': True,
        'use_case': 'Navigate between mansion rooms efficiently'
    },
    {
        'algorithm': 'Minimax with Alpha-Beta Pruning',
        'purpose': 'Optimal dialogue tree traversal',
        'time_complexity': 'O(b^(d/2)) best case, O(b^d) worst case',
        'space_complexity': 'O(d)',
        'implemented': True,
        'use_case': 'Interrogation strategy optimization'
    },
    {
        'algorithm': 'Constraint Satisfaction Problem',
        'purpose': 'Evidence analysis and suspect evaluation', 
        'time_complexity': 'O(d^n) where d=domain size, n=variables',
        'space_complexity': 'O(n)',
        'implemented': True,
        'use_case': 'Solve murder mystery based on collected clues'
    },
    {
        'algorithm': 'Wumpus World Inference',
        'purpose': 'Hazard detection and safe navigation',
        'time_complexity': 'O(n) for inference rules',
        'space_complexity': 'O(n) for knowledge base',
        'implemented': True,
        'use_case': 'Avoid dangerous rooms using logical reasoning'
    }
]

with open('algorithm_analysis.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['algorithm', 'purpose', 'time_complexity', 'space_complexity', 'implemented', 'use_case'])
    writer.writeheader()
    writer.writerows(algorithm_performance)

# 5. Save game state and solution data
game_solution = [
    {
        'variable': 'murderer',
        'solution': solution['murderer'],
        'confidence': f"{confidence:.2%}",
        'evidence_points': score,
        'total_possible': sum(c['weight'] for c in mystery_csp.constraints)
    },
    {
        'variable': 'weapon', 
        'solution': solution['weapon'],
        'confidence': f"{confidence:.2%}",
        'evidence_points': score,
        'total_possible': sum(c['weight'] for c in mystery_csp.constraints)
    },
    {
        'variable': 'location',
        'solution': solution['location'], 
        'confidence': f"{confidence:.2%}",
        'evidence_points': score,
        'total_possible': sum(c['weight'] for c in mystery_csp.constraints)
    },
    {
        'variable': 'motive',
        'solution': solution['motive'],
        'confidence': f"{confidence:.2%}",
        'evidence_points': score,
        'total_possible': sum(c['weight'] for c in mystery_csp.constraints)
    }
]

with open('mystery_solution.csv', 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['variable', 'solution', 'confidence', 'evidence_points', 'total_possible'])
    writer.writeheader()
    writer.writerows(game_solution)

print("=== DATA EXPORT COMPLETE ===")
print("Generated CSV files:")
print("1. mansion_layout.csv - Room connections, clues, hazards")
print("2. suspect_profiles.csv - Character data and guilt status") 
print("3. clue_analysis.csv - Evidence and constraint weights")
print("4. algorithm_analysis.csv - Algorithm complexity and usage")
print("5. mystery_solution.csv - Final solution with confidence scores")
print(f"\nTotal CSV files created: 5")
print(f"Mystery solved with {confidence:.1%} confidence!")
print(f"Solution: {solution['murderer']} killed Lord Ashford with {solution['weapon']} in the {solution['location']} for {solution['motive']}")

# Quick verification of file contents
print(f"\n=== CSV FILE VERIFICATION ===")
import os
for filename in ['mansion_layout.csv', 'suspect_profiles.csv', 'clue_analysis.csv', 'algorithm_analysis.csv', 'mystery_solution.csv']:
    if os.path.exists(filename):
        print(f"✅ {filename} created successfully")
    else:
        print(f"❌ {filename} creation failed")