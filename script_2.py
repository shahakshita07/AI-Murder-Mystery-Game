# 3. Constraint Satisfaction Problem for Clue Analysis and Suspect Evaluation

class MurderMysteryCSP:
    def __init__(self):
        # Variables: who, what, where, when
        self.variables = ['murderer', 'weapon', 'location', 'motive']
        
        # Domains: possible values for each variable
        self.domains = {
            'murderer': ['Butler', 'Maid', 'Chef', 'Heiress'],
            'weapon': ['Knife', 'Poison', 'Candlestick', 'Rope'],
            'location': ['Hall', 'Study', 'Library', 'Dining Room', 'Kitchen', 'Conservatory'],
            'motive': ['Money', 'Revenge', 'Blackmail', 'Inheritance']
        }
        
        # Constraints based on clues found
        self.constraints = []
        
        # Evidence collected (clue -> constraint impact)
        self.evidence = {}
        
    def add_evidence(self, clue_name, clue_data):
        """Add evidence which creates constraints"""
        self.evidence[clue_name] = clue_data
        
        # Create constraints based on clues
        if clue_name == "bloodstained_glove":
            # Glove belongs to Heiress, increases her suspicion
            self.add_constraint(lambda assignment: 
                              assignment['murderer'] == 'Heiress', weight=8)
            
        elif clue_name == "shattered_wine_glass": 
            # Glass was broken by Butler (innocent accident)
            self.add_constraint(lambda assignment:
                              assignment['murderer'] != 'Butler', weight=5)
            
        elif clue_name == "suspicious_ledger":
            # Ledger shows Heiress bribing Chef
            self.add_constraint(lambda assignment:
                              assignment['murderer'] == 'Heiress', weight=6)
            
        elif clue_name == "missing_knife":
            # Red herring - knife wasn't the weapon
            self.add_constraint(lambda assignment:
                              assignment['weapon'] != 'Knife', weight=9)
            
        elif clue_name == "poison_analysis":
            # If poison is confirmed as weapon
            self.add_constraint(lambda assignment:
                              assignment['weapon'] == 'Poison', weight=10)
            
        elif clue_name == "dining_room_scene":
            # Murder occurred in dining room
            self.add_constraint(lambda assignment:
                              assignment['location'] == 'Dining Room', weight=10)
            
        elif clue_name == "inheritance_motive":
            # Heiress inherits estate
            self.add_constraint(lambda assignment:
                              (assignment['murderer'] == 'Heiress' and 
                               assignment['motive'] == 'Inheritance'), weight=7)
    
    def add_constraint(self, constraint_func, weight=1):
        """Add a weighted constraint"""
        self.constraints.append({'func': constraint_func, 'weight': weight})
    
    def evaluate_assignment(self, assignment):
        """Evaluate how well an assignment satisfies constraints"""
        total_score = 0
        max_score = 0
        
        for constraint in self.constraints:
            max_score += constraint['weight']
            if constraint['func'](assignment):
                total_score += constraint['weight']
                
        return total_score, max_score
    
    def find_best_solution(self):
        """Find the assignment that best satisfies all constraints"""
        best_assignment = None
        best_score = -1
        best_confidence = 0
        
        # Generate all possible assignments
        for murderer in self.domains['murderer']:
            for weapon in self.domains['weapon']:
                for location in self.domains['location']:
                    for motive in self.domains['motive']:
                        assignment = {
                            'murderer': murderer,
                            'weapon': weapon, 
                            'location': location,
                            'motive': motive
                        }
                        
                        score, max_score = self.evaluate_assignment(assignment)
                        confidence = score / max_score if max_score > 0 else 0
                        
                        if score > best_score:
                            best_score = score
                            best_assignment = assignment
                            best_confidence = confidence
        
        return best_assignment, best_score, best_confidence
    
    def get_suspect_rankings(self):
        """Rank suspects based on evidence"""
        suspect_scores = {suspect: 0 for suspect in self.domains['murderer']}
        
        for murderer in self.domains['murderer']:
            for weapon in self.domains['weapon']:
                for location in self.domains['location']:
                    for motive in self.domains['motive']:
                        assignment = {
                            'murderer': murderer,
                            'weapon': weapon,
                            'location': location, 
                            'motive': motive
                        }
                        score, _ = self.evaluate_assignment(assignment)
                        suspect_scores[murderer] = max(suspect_scores[murderer], score)
        
        # Sort suspects by score (highest = most suspicious)
        ranked_suspects = sorted(suspect_scores.items(), 
                               key=lambda x: x[1], reverse=True)
        return ranked_suspects

# Test the CSP system
print("\n=== CONSTRAINT SATISFACTION PROBLEM ===")
mystery_csp = MurderMysteryCSP()

print("Initial domains:")
for var, domain in mystery_csp.domains.items():
    print(f"  {var}: {domain}")

print("\n=== Adding Evidence ===")
# Simulate discovering clues during gameplay
clues_found = [
    ("bloodstained_glove", "Found in Library, belongs to Heiress"),
    ("shattered_wine_glass", "Butler admits he dropped it accidentally"),
    ("suspicious_ledger", "Shows payments from Heiress to Chef"),
    ("missing_knife", "Red herring - not the murder weapon"),
    ("poison_analysis", "Wine contained deadly poison"),
    ("dining_room_scene", "Murder occurred in Dining Room"),
    ("inheritance_motive", "Heiress inherits father's estate")
]

for clue_name, description in clues_found:
    mystery_csp.add_evidence(clue_name, description)
    print(f"Added evidence: {clue_name} - {description}")

print(f"\nTotal constraints created: {len(mystery_csp.constraints)}")

print("\n=== Solving the Mystery ===")
solution, score, confidence = mystery_csp.find_best_solution()

print("CASE SOLVED!")
print(f"Confidence Level: {confidence:.2%}")
print("Solution:")
for key, value in solution.items():
    print(f"  {key.capitalize()}: {value}")

print(f"\nEvidence Score: {score}/{sum(c['weight'] for c in mystery_csp.constraints)}")

print("\n=== Suspect Rankings ===")
suspect_rankings = mystery_csp.get_suspect_rankings()
print("Most to least suspicious:")
for i, (suspect, score) in enumerate(suspect_rankings, 1):
    print(f"  {i}. {suspect}: {score} points")