# 2. Minimax with Alpha-Beta Pruning for Dialogue Trees

class DialogueNode:
    def __init__(self, speaker, question, responses=None, is_terminal=False, value=0):
        self.speaker = speaker  # 'detective' or suspect name
        self.question = question
        self.responses = responses or []  # List of possible responses
        self.is_terminal = is_terminal
        self.value = value  # Utility value for terminal nodes
        self.children = []

class DialogueSystem:
    def __init__(self):
        # Define the suspects from the user's description
        self.suspects = {
            'Butler': {
                'name': 'James',
                'personality': 'Calm, polite, but evasive',
                'guilty': False,
                'truth_value': 5,  # How truthful they are (1-10)
                'suspicion_level': 3  # Current suspicion (1-10)
            },
            'Maid': {
                'name': 'Clara', 
                'personality': 'Nervous and chatty',
                'guilty': False,
                'truth_value': 8,
                'suspicion_level': 2
            },
            'Chef': {
                'name': 'Marco',
                'personality': 'Defensive and grumpy', 
                'guilty': False,
                'truth_value': 6,
                'suspicion_level': 4
            },
            'Heiress': {
                'name': 'Sophia',
                'personality': 'Elegant, clever, manipulative',
                'guilty': True,  # The actual murderer
                'truth_value': 2,  # Very untruthful
                'suspicion_level': 1  # Initially low suspicion
            }
        }
    
    def minimax_with_pruning(self, node, depth, maximizing_player, alpha, beta, suspect_name):
        """
        Minimax with alpha-beta pruning for dialogue optimization
        Detective wants to maximize information gain (find contradictions)
        Suspect wants to minimize suspicion 
        """
        if depth == 0 or node.is_terminal:
            return self.evaluate_dialogue_outcome(node, suspect_name)
        
        if maximizing_player:  # Detective's turn
            max_eval = float('-inf')
            for child in node.children:
                eval_score = self.minimax_with_pruning(child, depth-1, False, alpha, beta, suspect_name)
                max_eval = max(max_eval, eval_score)
                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    break  # Alpha-beta pruning
            return max_eval
        else:  # Suspect's turn
            min_eval = float('inf')
            for child in node.children:
                eval_score = self.minimax_with_pruning(child, depth-1, True, alpha, beta, suspect_name)
                min_eval = min(min_eval, eval_score)
                beta = min(beta, eval_score)
                if beta <= alpha:
                    break  # Alpha-beta pruning
            return min_eval
    
    def evaluate_dialogue_outcome(self, node, suspect_name):
        """Evaluate the utility of a dialogue outcome"""
        suspect = self.suspects[suspect_name]
        
        # Factors affecting the evaluation:
        # 1. Information gained (detective benefits from contradictions)
        # 2. Suspicion level increase/decrease
        # 3. Whether suspect reveals truth or lies successfully
        
        base_value = node.value
        
        # If suspect is guilty and reveals truth, very bad for suspect
        if suspect['guilty'] and 'truth' in node.question.lower():
            base_value -= 20
        
        # If suspect deflects suspicion successfully, good for suspect  
        if 'deflect' in node.question.lower():
            base_value += suspect['truth_value'] - 5
            
        return base_value
    
    def create_butler_dialogue_tree(self):
        """Create dialogue tree for Butler interrogation"""
        
        # Root: Detective asks initial question
        root = DialogueNode('detective', 
                           'You were in the Dining Room when Lord Ashford died?')
        
        # Butler's possible responses
        honest_response = DialogueNode('Butler', 
                                     'Yes, I was polishing silverware when he collapsed.')
        
        evasive_response = DialogueNode('Butler',
                                      'I... I may have stepped out briefly.')
        
        root.children = [honest_response, evasive_response]
        
        # Detective follow-up to honest response
        followup_honest = DialogueNode('detective',
                                     'Did you touch the wine glass?')
        honest_response.children = [followup_honest]
        
        # Butler's responses to follow-up
        butler_admits = DialogueNode('Butler',
                                   'Yes, I dropped it in panic. I should have said so earlier.',
                                   is_terminal=True, value=10)  # Good info for detective
        
        butler_denies = DialogueNode('Butler', 
                                   'No, I never touched it!',
                                   is_terminal=True, value=-5)  # Contradiction detected
        
        followup_honest.children = [butler_admits, butler_denies]
        
        # Detective follow-up to evasive response  
        followup_evasive = DialogueNode('detective',
                                      'Where did you go?')
        evasive_response.children = [followup_evasive]
        
        butler_cellar = DialogueNode('Butler',
                                   'To the Cellar for wine, but the fumes drove me out.',
                                   is_terminal=True, value=8)  # Hazard warning + alibi
        
        butler_vague = DialogueNode('Butler',
                                  'Just... around. Nothing important.',
                                  is_terminal=True, value=5)  # Still suspicious
        
        followup_evasive.children = [butler_cellar, butler_vague]
        
        return root

# Test the dialogue system
dialogue_system = DialogueSystem()

print("\n=== MINIMAX DIALOGUE SYSTEM ===")
print("Suspects and their profiles:")
for role, info in dialogue_system.suspects.items():
    status = "GUILTY" if info['guilty'] else "innocent"
    print(f"{role} ({info['name']}): {info['personality']} - {status}")
    print(f"  Truth Level: {info['truth_value']}/10, Suspicion: {info['suspicion_level']}/10")

print("\n=== Butler Dialogue Tree Example ===")
butler_tree = dialogue_system.create_butler_dialogue_tree()

def print_dialogue_tree(node, depth=0):
    indent = "  " * depth
    speaker_prefix = f"[{node.speaker.upper()}]" if node.speaker else ""
    print(f"{indent}{speaker_prefix} {node.question}")
    
    for child in node.children:
        print_dialogue_tree(child, depth + 1)

print_dialogue_tree(butler_tree)

# Simulate minimax decision making
print(f"\n=== Minimax Analysis ===")
print("Running minimax with alpha-beta pruning on Butler dialogue...")

# Add some dummy children for demonstration
optimal_value = dialogue_system.minimax_with_pruning(
    butler_tree, depth=3, maximizing_player=True, 
    alpha=float('-inf'), beta=float('inf'), suspect_name='Butler'
)

print(f"Optimal dialogue value for detective: {optimal_value}")
print("(Higher values = more information gained, contradictions found)")