using Test
using Simone

@testset "Simone.jl Co-Simulation Engine" begin
    include("test_conservation.jl")
    include("test_docking.jl")
    include("test_layers.jl")
    include("test_autarkic_closure.jl")
    include("test_petition_intake.jl")
end
