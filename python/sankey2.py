import plotly.plotly as py
import plotly
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot

init_notebook_mode(connected=True)

plotly.tools.set_credentials_file(username='manfred.moosleitner', api_key='UTpisrO4OEiCWBWqjrVP')

data = dict(
	type='sankey',
	orientation="v",
	arrangement="snap",
	node=dict(
		pad=15,
		thickness=20,
		line=dict(
			color="black",
			width=0.5
		),
		label=["thema1", "thema2", "thema3", "1960", "1970", "1980"],
		color=["blue", "red", "green", "black", "black", "black"]
	),
	link=dict(
		source=[0, 1, 2, 0, 1, 2],
		target=[3, 4, 5, 5, 3, 4],
		value=[8, 4, 2, 8, 4, 2],
		color=["blue", "red", "green", "blue", "red", "green"]
	))

layout = dict(
	title="Basic Sankey Diagram",
	font=dict(
		size=10
	)
)

fig = dict(data=[data], layout=layout)
plot(fig, validate=False)
