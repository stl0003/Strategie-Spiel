using Microsoft.AspNetCore.SignalR;
using Strategie_Spiel;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR(); // SignalR-Dienste
builder.Services.AddControllersWithViews(); // optional, falls Sie MVC brauchen

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapHub<Strategie_Spiel.GameHub>("/gamehub");

app.Run();