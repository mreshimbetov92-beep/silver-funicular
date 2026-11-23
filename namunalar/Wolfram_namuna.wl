Clear[x, f];
f[x_] := x^3 - 3 x;
D[f[x], x]
Solve[D[f[x], x] == 0, x]
Plot[f[x], {x, -3, 3}]
