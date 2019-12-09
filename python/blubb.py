fill = '*'
size = 7

output = []
for i in range(size):
    output += ' '

l = int(size/2)
r = int(size/2)
for i in range(size-1):
    for j in range(l, r):
        output[j] = fill
        print(output)
    l -= 1
    r += 1