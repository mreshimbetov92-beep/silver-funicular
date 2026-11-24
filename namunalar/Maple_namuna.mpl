restart;
f := x -> x^3 - 3*x;
diff(f(x), x);
solve(diff(f(x), x) = 0, x);
plot(f(x), x=-3..3);
