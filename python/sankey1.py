import pandas as pd
import plotly.plotly as py
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot


data = pd.read_csv("data_parallel.csv")

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

colors = [color[key] for key in sorted(color)]
labels1 = [thema for thema in sorted(color)]
labels2 = [color[key] for key in sorted(color)]
labels = labels1 + labels2

source = []
target = []
values = []

aggregation = data.groupby(['Thema', 'Jahr'])['Thema'].count()
for (k1, k2), v in aggregation.items():
	# print(k1, k2, v)
	source.append(themen[k1])
	target.append(k2)
	values.append(v)


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
	title='Erste "Stränge"',
	height=772,
	font=dict(
		size=10
	),
)

fig = dict(data=[data_trace], layout=layout)
iplot(fig, validate=False)
