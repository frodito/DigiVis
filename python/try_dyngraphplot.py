import networkx as nx
from dyngraphplot import DynGraphPlot

# create a random graph and plot it
G = nx.fast_gnp_random_graph(50, 0.1)
plot = DynGraphPlot(G)

# pause until "Enter" is pressed, as mode is non-blocking by default
input()