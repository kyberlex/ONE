using Test
using Simone

@testset "Simone.jl Co-Simulation Engine" begin
    include("test_conservation.jl")
    include("test_docking.jl")
end
