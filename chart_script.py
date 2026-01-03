import plotly.graph_objects as go
import pandas as pd

# Data provided
data = [
    {
        "Algorithm": "BFS Pathfinding",
        "Time_Complexity": 2,
        "Space_Complexity": 2,
        "Implementation_Difficulty": 3,
        "Game_Impact": 8
    },
    {
        "Algorithm": "Minimax Alpha-Beta", 
        "Time_Complexity": 3,
        "Space_Complexity": 2,
        "Implementation_Difficulty": 4,
        "Game_Impact": 9
    },
    {
        "Algorithm": "Constraint Satisfaction",
        "Time_Complexity": 4,
        "Space_Complexity": 3,
        "Implementation_Difficulty": 5,
        "Game_Impact": 10
    },
    {
        "Algorithm": "Wumpus Inference",
        "Time_Complexity": 2,
        "Space_Complexity": 2,
        "Implementation_Difficulty": 3,
        "Game_Impact": 7
    }
]

# Create DataFrame
df = pd.DataFrame(data)

# Abbreviate algorithm names to fit 15 char limit
df['Algorithm'] = df['Algorithm'].replace({
    'Minimax Alpha-Beta': 'Minimax A-B',
    'Constraint Satisfaction': 'Constraint Sat'
})

# Brand colors
colors = ['#1FB8CD', '#DB4545', '#2E8B57', '#5D878F']

# Create grouped bar chart
fig = go.Figure()

metrics = ['Time_Complexity', 'Space_Complexity', 'Implementation_Difficulty', 'Game_Impact']
metric_labels = ['Time Complex', 'Space Complex', 'Implement Diff', 'Game Impact']

for i, (metric, label) in enumerate(zip(metrics, metric_labels)):
    fig.add_trace(go.Bar(
        name=label,
        x=df['Algorithm'],
        y=df[metric],
        marker_color=colors[i],
        cliponaxis=False
    ))

# Update layout
fig.update_layout(
    title='AI Algorithms Performance - Murder Game',
    barmode='group',
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

fig.update_xaxes(title='Algorithm')
fig.update_yaxes(title='Score')

# Save as PNG and SVG
fig.write_image('ai_algorithms_chart.png')
fig.write_image('ai_algorithms_chart.svg', format='svg')