import pandas as pd
import numpy as np
import json, urllib
import plotly.plotly as py

data = pd.read_csv("data_parallel.csv")
# print(data)

color = {
    "Anpassung": "#E74C3C",
    "Erfahrung": "#1abc9c",
    "Lernen": "#283747",
    "Raum und Zeit": "#f39c12",
    "Realität": "#5499c7",
    "Wirklichkeit": "#f0c40f",
    "Sprache": "#82e0aa",
    "Viabilität": "#cacfd2",
    "Wahrnehmung": "#ff00ff",
}

themen = {
    "Anpassung": 0,
    "Erfahrung": 1,
    "Lernen": 2,
    "Raum und Zeit": 3,
    "Realität": 4,
    "Wirklichkeit": 5,
    "Sprache": 6,
    "Viabilität": 7,
    "Wahrnehmung": 8,
}

jahre = {}
for i, jahr in enumerate(range(1960, 2001)):
    jahre[jahr] = i

colors = []
labels1 = []
labels2 = []
source = {}
target = []
values = {}


# aggregation
for (idx, cells) in data.iterrows():
    labels1.append(cells['Thema'])
    labels2.append(cells['Jahr'])

    colors.append(color[cells['Thema']])
    if cells['Thema'] in values:
        values['Thema'] += 1
    else:
        values['Thema'] = 1
    if (cells['Thema'] + cells['Jahr']) in source:
        source[cells['Thema'] + cells['Jahr']] += 1
    else:
        source[cells['Thema'] + cells['Jahr']] = 1
        
    source.append(themen[cells['Thema']])
  
    target.append(cells['Jahr'])
    values.append(1)

labels1 =
labels = sort(labels1) + sort(labels2)



data_trace = dict(
    type='sankey',
    domain=dict(
        x=[1960, 2000],
        y=[0, 8]
    ),
    orientation="h",
    valueformat=".0f",
    node=dict(
        pad=10,
        thickness=30,
        line=dict(
            color="black",
            width=0
        ),
        label=labels,
        color=colors
    ),
    link=dict(
        source=source,
        target=target,
        value=values,
        color=colors,
    )
)

layout = dict(
    title="Bla",
    height=772,
    font=dict(
        size=10
    ),
)

fig = dict(data=[data_trace], layout=layout)
py.iplot(fig, validate=False)
